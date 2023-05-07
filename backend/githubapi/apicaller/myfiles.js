const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetch = require('node-fetch');

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
    const query = `
        SELECT github_username, access_token 
        FROM GitHubCredential 
        WHERE username = $1`;
    const values = [username];

    const queryCredentials = await pool.query(query, values);

    const queryGitHubUsernameToken = queryCredentials.rows;

    let optimalGitHubUsername;
    let maxStorage = Number.MAX_VALUE;

    // Do not use this method to obtain the storage!
    for (let i = 0; i < queryGitHubUsernameToken.length; i++) {
        const gh_username = queryGitHubUsernameToken[i].github_username;
        const gh_access_token = queryGitHubUsernameToken[i].access_token;
        
        let currStorage = 0;

        try {
            const repositories = await getRepositoriesSize(gh_access_token);

            for (let curr_repo of repositories) {
                currStorage += curr_repo.size;
            }

            // console.log(currStorage);

            if (maxStorage > currStorage) {
                maxStorage = currStorage;
                optimalGitHubUsername = gh_username;
            }
        } catch(error) {
            res.status(401).json({ message: "GitHub API Error" });
        }
    }
    
    console.log(optimalGitHubUsername);

    /*
    const createQuery = `
        INSERT INTO GitHubCredential
        (username, github_username, email, access_token)
        VALUES ($1, $2, $3, $4)
    `;

    const createParam = req.body;

    try {
        const queryResult = await pool.query(createQuery, [
            decoded.username,
            createParam.github_username,
            createParam.email,
            createParam.access_token,
        ]);
        res.json({
            success: true,
            message: `Created ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
    */
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