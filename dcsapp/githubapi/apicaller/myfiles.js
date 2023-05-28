const jwt = require("jsonwebtoken");
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
 * Creation of a new repo when the current repo is almost full or when we need more than 1 repo
 */
async function createNewRepo(personal_access_token, new_repo_name) {
    const octokit = new Octokit({
        auth: personal_access_token
    });

    const options = {
        name: new_repo_name,
        private: true
    };

    return await octokit.repos.createForAuthenticatedUser(options);
}

/**
 * Create the new repo entry on pg db
 */
async function createNewRepoPgDb(pool, username, credID, new_repo_name) {
    const insertGH = await pool.query(`
        INSERT INTO 
        GitHubRepoList (username, gh_account_id, repo_name) 
        VALUES ($1, $2, $3)
    `, [username,
        credID,
        new_repo_name]);

    const repoID = await pool.query(`
        SELECT id
        FROM GitHubRepoList
        WHERE username = $1 
            AND gh_account_id = $2 
            AND repo_name = $3
    `, [username,
        credID,
        new_repo_name]);

    return repoID.rows[0].id;
}

/**
 * Performs uploading of the file to GitHub using octokit
 */
async function uploadFileToGitHub(path, octokit, optimalGitHubCredUsername, optimalRepoFullName, originalname, optimalFileName, branch, ghEmail) {
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
            email: ghEmail
        },
        branch: branch
    });

    // console.log(data);

    return data;
}

/**
 * Inserts the filename into GitHubFiles to keep a record and a symbolic 
 * link to the remote github where it is at
 */
async function recordFilePg(pool, username, originalFileName, gh_account_id, repoID, ghFileName) {
    const queryRootDir = `
        SELECT id
        FROM FileSystemPaths
        WHERE path_level = 0
            AND username = '${username}'
    `;
    const rootQueryResult = await pool.query(queryRootDir, []);
    const rootID = rootQueryResult.rows[0].id;

    const partitionName = `GitHubFiles_${username}`;

    const recordFileQuery = `
        INSERT INTO ${partitionName} (username, filename, gh_account_id, gh_repo_id, gh_filename, path_dir) 
        VALUES ($1, $2, $3, $4, $5, $6)`;

    return await pool.query(recordFileQuery, [username, originalFileName, gh_account_id, repoID, ghFileName, rootID]);
}

// Obtain latest repo from name
function extractIndex(str) {
    const prefix = 'dcs_';
    const indexStr = str.slice(prefix.length);
    const index = parseInt(indexStr);
    return index;
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
exports.createNewFile = async (file, req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);
    const hardRepoLimitSize = 51200; // In kB

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
        SELECT id, github_username, access_token, email
        FROM GitHubCredential 
        WHERE username = $1`;
    const values = [username];

    const queryCredentials = await pool.query(queryForCredentials, values);

    const queryGitHubUsernameToken = queryCredentials.rows;

    const queryForAccountStorage = `
        SELECT gh_account_id, gh_storage, gh_latest_repo_storage
        FROM GitHubAccountStorage
        WHERE gh_account_id IN (
            SELECT id
            FROM GitHubCredential
            WHERE username = $1
        )
        ORDER BY gh_storage ASC
        LIMIT 1`;

    const queryAllAccountStorage = await pool.query(queryForAccountStorage, values);
    const optimalGitHubAccount = queryAllAccountStorage.rows[0].gh_account_id;

    // All required information for upload decision
    let optimalGitHubCredUsername;
    let optimalGitHubCredAccessToken;
    let optimalGitHubEmail;
    let optimalRepoFullName;
    let optimalFileName;
    let currStorageOfOptimalAccount = queryAllAccountStorage.rows[0].gh_storage;
    let currStorageOfOptimalRepo = queryAllAccountStorage.rows[0].gh_latest_repo_storage;

    // Obtain the GitHub's username for otimal account as well as the personal access token
    for (currCred of queryGitHubUsernameToken) {
        if (currCred.id == optimalGitHubAccount) {
            optimalGitHubCredUsername = currCred.github_username;
            optimalGitHubCredAccessToken = currCred.access_token;
            optimalGitHubEmail = currCred.email;
            break;
        }
    }

    // Get latest repo name
    const queryForReponame = `
        SELECT id, repo_name
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
    let originalname, filename, path;

    if (file != null) {
        originalname = file.originalname;
        filename = file.filename;
        path = file.path;
    } else {
        originalname = req.file.originalname;
        filename = req.file.filename;
        path = req.file.path;
    }

    const octokit = new Octokit({
        auth: optimalGitHubCredAccessToken
    });
    const branch = "main";

    try {
        // Update the GitHub account's storage and performing checks
        const stats = fs.statSync(path);
        const fileSizeInBytes = stats.size;
        const fileSizeInKB = Math.round(fileSizeInBytes / 1024);
        const newAccountStorage = BigInt(currStorageOfOptimalAccount) + BigInt(fileSizeInKB);
        const newRepoStorage = BigInt(currStorageOfOptimalRepo) + BigInt(fileSizeInKB);

        if (fileSizeInKB > hardRepoLimitSize) {
            res.status(401).json({ success: false, message: "Yowza file too large!" });
            return;
        }

        const repoIndexID = extractIndex(optimalRepoFullName);
        let resultingRepoID = queryOptimalRepoName.rows[0].id;

        /**
         * If new size exceeds repo limit, then you have to create a new repo before 
         * uploading file to GitHub
         * 
         * 2 cases:
         * 
         * 1) Create new repo, and update GitHubRepoList, GitHubFID, GitHubAccountStorage (with the new 
         * storage of new repo and the new account storage) and you can straight away respond back to the 
         * client already.
         * 2) Just upload to GitHub and update the new GitHubAccountStorage, GitHubFID by incrementing.
         */
        if (newRepoStorage >= hardRepoLimitSize) {
            // Create a new repo
            const newRepoIndexID = repoIndexID + 1;
            const newRepoName = "dcs_" + newRepoIndexID.toString();
            const initializeNewRepo = await createNewRepo(optimalGitHubCredAccessToken, newRepoName);
            const newRepoID = await createNewRepoPgDb(pool, username, optimalGitHubAccount, newRepoName);

            // Upload file to GitHub
            const dataUpload = await uploadFileToGitHub(path, octokit, optimalGitHubCredUsername, newRepoName, originalname, optimalFileName, branch, optimalGitHubEmail);

            // Get latest filename
            const queryForStorage = `
            UPDATE GitHubAccountStorage
            SET gh_storage = $2, gh_latest_repo_storage = $3
            WHERE gh_account_id = $1`;
            const queryUpdateForNewStorage = await pool.query(queryForStorage, [optimalGitHubAccount, newAccountStorage, fileSizeInKB]);

            // Update the latest FID
            const queryUpdateForFID = `
            UPDATE GitHubFID
            SET gh_file_uid = $2, gh_repo_id = $3
            WHERE gh_account_id = $1`;
            const queryUpdateForNewFID = await pool.query(queryUpdateForFID, [optimalGitHubAccount, parseInt(optimalFileName) + 1, newRepoID]);

            resultingRepoID = newRepoID;
        } else {
            // Uploade the file to GitHub
            const dataUpload = await uploadFileToGitHub(path, octokit, optimalGitHubCredUsername, optimalRepoFullName, originalname, optimalFileName, branch, optimalGitHubEmail);

            // Get latest filename
            const queryForStorage = `
            UPDATE GitHubAccountStorage
            SET gh_storage = $2, gh_latest_repo_storage = $3 
            WHERE gh_account_id = $1`;
            const queryUpdateForNewStorage = await pool.query(queryForStorage, [optimalGitHubAccount, newAccountStorage, newRepoStorage]);

            // Update the latest FID
            const queryUpdateForFID = `
            UPDATE GitHubFID
            SET gh_file_uid = $2
            WHERE gh_account_id = $1`;
            const queryUpdateForNewFID = await pool.query(queryUpdateForFID, [optimalGitHubAccount, parseInt(optimalFileName) + 1]);
        }

        const recordFile = await recordFilePg(pool, username, originalname, optimalGitHubAccount, resultingRepoID, optimalFileName);

        if (file == null) {
            res.json({
                success: true,
                message: `Successfully uploaded file!`
            });
        }
    } catch (error) {
        res.status(401).json({ success: false, message: "File upload failed!" });
        console.log(error);
    }
};

exports.getAllFiles = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const token = checkAuthHeader(authHeader, res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const tablePartitionName = `GitHubFiles_${decoded.username}`;

        const queryResult = await pool.query(
            `SELECT id, gh_account_id, gh_repo_id, gh_filename, filename 
            FROM ${tablePartitionName} 
            WHERE username = $1 AND is_deleted = false`,
            [decoded.username]
        );

        res.json(queryResult.rows);
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }
};

exports.renameFile = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const token = checkAuthHeader(authHeader, res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const tablePartitionName = `GitHubFiles_${decoded.username}`;

        const queryResult = await pool.query(
            `UPDATE GitHubFiles
            SET filename = $3
            WHERE username = $1 
                AND id = $2`
            , [decoded.username, req.body.id, req.body.new_filename]
        );

        res.json(
            {
                success: true,
                message: `Successfully renamed file!`
            }
        );
    } catch (err) {
        // console.error(err);
        res.status(401).json({ message: "Failed to rename!" });
    }
};

exports.deleteFiles = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const token = checkAuthHeader(authHeader, res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const tablePartitionName = `GitHubFiles_${decoded.username}`;

        const queryResult = await pool.query(
            `UPDATE GitHubFiles
            SET is_deleted = true
            WHERE username = $1
                AND id = $2`
            , [decoded.username, req.params.id]
        );

        res.json(
            {
                success: true,
                message: `Successfully deleted file!`
            }
        );
    } catch (err) {
        // console.error(err);
        res.status(401).json({ message: "Failed to delete!" });
    }
};


exports.checkAuthHeader = checkAuthHeader;
