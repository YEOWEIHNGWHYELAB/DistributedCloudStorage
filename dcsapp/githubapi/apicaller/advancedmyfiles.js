const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const myFilesFunc = require("./myfiles");

async function getDownloadLink(octokit, owner, repo, ghPath) {
    try {
        return await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath,
        });
    } catch (error) {
        return error;
    }
}

async function getRepoName(pool, metaFileInfo) {
    const getGHRepoName = await pool.query(
        `
        SELECT repo_name
        FROM GitHubRepoList
        WHERE id = $1
    `,
        [metaFileInfo.gh_repo_id]
    );

    const ghRepoName = getGHRepoName.rows[0].repo_name;

    return ghRepoName;
}

async function getGHUserCredentialInfo(pool, metaFileInfo) {
    const getGHUsername = await pool.query(
        `
        SELECT github_username, access_token
        FROM GitHubCredential
        WHERE id = $1
    `,
        [metaFileInfo.gh_account_id]
    );

    const ghUsername = getGHUsername.rows[0].github_username;
    const ghPAT = getGHUsername.rows[0].access_token;

    return { ghPAT, ghUsername };
}

async function getMetaFileInfo(pool, req) {
    const getFileMetaInfo = await pool.query(
        `
        SELECT gh_account_id, gh_repo_id, gh_filename, filename
        FROM GitHubFiles
        WHERE id = ANY($1::bigint[])
    `,
        [req.body.id]
    );

    const metaFileInfo = getFileMetaInfo.rows;

    return metaFileInfo;
}

/**
 * We can only obtain a single file download link at a time, if you want to obtain
 * multiple file download link, please do it at the frontend side and
 */
exports.getDownloadLink = async (req, res, pool) => {
    // Perform a look up on where the file is located remotely on GitHub
    // We need credential ID, repo ID, filename and we are given file ID
    const metaFileInfo = await getMetaFileInfo(pool, req);

    let downloadUrlArr = [];
    let filenameArr = [];

    for (currMetaInfo of metaFileInfo) {
        const { ghPAT, ghUsername } = await getGHUserCredentialInfo(
            pool,
            currMetaInfo
        );

        const ghRepoName = await getRepoName(pool, currMetaInfo);

        // Perform GitHub API to obtain the actual file
        const octokit = new Octokit({
            auth: ghPAT,
        });

        try {
            const { data } = await getDownloadLink(
                octokit,
                ghUsername,
                ghRepoName,
                currMetaInfo.gh_filename
            );

            downloadUrlArr.push(data.download_url);
            filenameArr.push(currMetaInfo.filename);
        } catch (error) {
            res.json({
                success: false,
                message: "Unable to retrieve file!",
            });
            // console.log(error);
        }
    }

    res.json({
        success: true,
        message: "Download link obtained!",
        download_url: downloadUrlArr,
        filename: filenameArr
    });
};

exports.getFilesPag = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const token = myFilesFunc.checkAuthHeader(authHeader, res);

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    let deletionQuery = false;

    if (req.body.is_deleted) {
        deletionQuery = req.body.is_deleted;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const tablePartitionName = `GitHubFiles_${decoded.username}`;

        let queryPaginatedFiles = `
            SELECT id, gh_account_id, filename, created_at
            FROM ${tablePartitionName}
            WHERE username = $1 
                AND is_deleted = ${deletionQuery}
        `;

        if (req.body.search && req.body.search.trim() !== "") {
            queryPaginatedFiles += `AND filename ILIKE '%${req.body.search.trim()}%' `;
        }

        if (req.body.extension && req.body.extension.trim() !== "") {
            const normalizedExtension = req.body.extension.startsWith(".")
                ? req.body.extension
                : `.${req.body.extension}`;
            queryPaginatedFiles += `AND substring(filename from '\\.[^.]*$') ILIKE '${normalizedExtension.trim()}%' `;
        }

        queryPaginatedFiles += `LIMIT $2 OFFSET $3`;

        const queryResult = await pool.query(queryPaginatedFiles, [
            decoded.username,
            limit,
            offset,
        ]);

        const queryPageCount = `
            SELECT COUNT(id) AS num_files
            FROM GitHubFiles
            WHERE username = $1 AND is_deleted = false
        `;

        const queryPageCountResult = await pool.query(queryPageCount, [
            decoded.username,
        ]);

        res.json({
            success: true,
            results: queryResult.rows,
            maxpage: Math.ceil(queryPageCountResult.rows[0].num_files / limit),
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({
            success: false,
            message: "Unable to retrieve files",
        });
    }
};

exports.multipleDelete = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const token = myFilesFunc.checkAuthHeader(authHeader, res);

    const idArr = [req.body.id];
    const isDeletion = req.body.is_deletion;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const tablePartitionName = `GitHubFiles_${decoded.username}`;

        const mulDelQuery = `
            UPDATE ${tablePartitionName}
            SET is_deleted = ${isDeletion} 
            WHERE username = '${decoded.username}' AND 
                id = ANY($1::bigint[])`;

        const queryResult = await pool.query(mulDelQuery, idArr);

        const messageDel = isDeletion ? "delete" : "restore"; 

        res.json({
            success: true,
            message: `Successfully ${messageDel} file!`
        });
    } catch (err) {
        // console.error(err);
        res.status(401).json({ success: false, message: "Failed to delete!" });
    }
};
