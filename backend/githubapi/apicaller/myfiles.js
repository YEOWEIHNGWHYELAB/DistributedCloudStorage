const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require('node-fetch');
const { Octokit } = require("@octokit/rest");
const fs = require("fs");


// Check if the auth header exist from DCS
function checkAuthHeader(authHeader, res) {
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    return token = authHeader.split(" ")[1];
}

/**
 * Get repo + size by GitHub Account
 * 
 * DO NOT USE THIS for determining which account to upload files GitHub storage 
 * takes a long time to be up to date!
 * 
 * You could use this for statistics for non-mission critical application
 */
async function getRepositoriesSize(token) {
    const response = await fetch('https://api.github.com/user/repos', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json'
        }
    });

    const repositories = await response.json();

    const result = [];

    for (const repository of repositories) {
        const repoName = repository.name;
        const response = await fetch(`https://api.github.com/repos/${repository.full_name}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        const repoDetails = await response.json();
        const size = repoDetails.size;

        result.push({ repoName, size });
    }

    return result;
}

/**
 * Get existing account storage, then chose the one with lowest first.
 * 
 * Get the latest repo upload ID and verify the storage again. If the
 * repo + new file size exceeds a certain size, then create a new repo
 * then update the latest repo ID and update the filename allocation.
 * 
 * Insert into the file table with the original file name and the name 
 * on github.
 */
exports.createNewFile = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded;
    try {
        decoded = jwt.verify(dcsAuthToken, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        // console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const queryForCredentials = `
        SELECT id, github_username, access_token 
        FROM GitHubCredential 
        WHERE username = $1`;
    const values = [username];

    const queryCredentials = await pool.query(queryForCredentials, values);

    const queryGitHubUsernameToken = queryCredentials.rows;

    const queryForAccountStorage = `
        SELECT gh_account_id, gh_storage
        FROM GitHubAccountStorage
        WHERE gh_account_id IN (
            SELECT gh_account_id
            FROM GitHubCredential
            WHERE username = $1
        )
        ORDER BY gh_storage ASC
        LIMIT 1`;

    const queryAllAccountStorage = await pool.query(queryForAccountStorage, [username]);
    const optimalGitHubAccount = queryAllAccountStorage.rows[0].gh_account_id;
    
    // All required information for upload decision
    let optimalGitHubCredUsername;
    let optimalGitHubCredAccessToken;
    let optimalRepoFullName;
    let optimalFileName;
    
    // Obtain the GitHub's username for otimal account as well as the personal access token
    for (currCred of queryGitHubUsernameToken) {
        if (currCred.id == optimalGitHubAccount) {
            optimalGitHubCredUsername = currCred.github_username;
            optimalGitHubCredAccessToken = currCred.access_token;
        }
    }

    // Get latest repo name
    const queryForReponame = `
        SELECT repo_name
        FROM GitHubRepoList
        WHERE id = (
            SELECT gh_repo_id
            FROM GitHubFID
            WHERE gh_account_id = $1)
    `;
    const queryOptimalRepoName = await pool.query(queryForReponame, [optimalGitHubAccount]);
    optimalRepoFullName = queryOptimalRepoName.rows[0].repo_name;

    // Get latest filename
    const queryForFileName = `
        SELECT gh_file_uid
        FROM GitHubFID
        WHERE gh_account_id = $1
    `;
    const queryOptimalFileName = await pool.query(queryForFileName, [optimalGitHubAccount]);
    optimalFileName = queryOptimalFileName.rows[0].gh_file_uid;
    
    // Upload to chosen GitHub optimal account
    const { originalname, filename, path } = req.file;
    const octokit = new Octokit({
        auth: optimalGitHubCredAccessToken
    });
    const branch = "main";

    try {
        const fileContent = fs.readFileSync(path);
        const encodedContent = Buffer.from(fileContent).toString("base64");

        const { data } = await octokit.repos.createOrUpdateFileContents({
            owner: optimalGitHubCredUsername,
            repo: optimalRepoFullName,
            message: `Added new file ${originalname}`,
            content: encodedContent,
            path: optimalFileName,
            committer: {
                name: optimalGitHubCredUsername,
                email: "whyelab@gmail.com"
            },
            branch: branch
        });

        // console.log(data);

        res.json({
            success: true,
            message: `Successfully uploaded file!`
        });
    } catch (error) {
        res.status(401).json({ message: "File upload failed!" });
        console.log(error);
    }

    // Update file ID & GitHub latest account if applicable

};

exports.getAllFiles = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    const token = checkAuthHeader(authHeader, res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const queryResult = await pool.query(
            "SELECT id, github_username, email, access_token FROM GitHubCredential WHERE username = $1",
            [decoded.username]
        );

        res.json(queryResult.rows);
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }
};

/*
exports.editCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    let editCredentialsQueryBuiler = [];
    let setClauses = [];

    const updateParams = req.body;

    editCredentialsQueryBuiler.push(`UPDATE GitHubCredential SET`);

    for (const key in updateParams) {
        if (key == "id") {
            continue;
        }

        const value = updateParams[key];

        if (value != null) {
            setClauses.push(`${key} = '${value}'`);
        }
    }

    editCredentialsQueryBuiler.push(setClauses.join(", "));

    editCredentialsQueryBuiler.push(`WHERE id = ${updateParams.id}`);

    const editCredentialsQuery = editCredentialsQueryBuiler.join(" ");

    try {
        const queryResult = await pool.query(editCredentialsQuery);
        res.json({
            success: true,
            message: `Updated ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

exports.deleteCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const sqlQuery = `DELETE FROM GitHubCredential WHERE id = $1`;
    const idToDelete = [req.params.id];

    try {
        const queryResult = await pool.query(sqlQuery, idToDelete);
        res.json({
            success: true,
            message: `Deleted ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

exports.deleteMultipleCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const sqlQuery = `DELETE FROM GitHubCredential WHERE id = ANY($1::int[])`;

    const idsToDelete = [req.body.id];

    try {
        const queryResult = await pool.query(sqlQuery, idsToDelete);
        res.json({
            success: true,
            message: `Deleted ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
*/