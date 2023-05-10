const jwt = require("jsonwebtoken");
const fetch = require('node-fetch');
const { Octokit } = require("@octokit/rest");
const fs = require("fs");

async function getDownloadLink(octokit, owner, repo, ghPath) {
    try {
        return await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath
        });
    } catch (error) {
        console.log(error);
    }
}

async function getRepoName(pool, metaFileInfo) {
    const getGHRepoName = await pool.query(`
        SELECT repo_name
        FROM GitHubRepoList
        WHERE id = $1
    `, [metaFileInfo.gh_repo_id]);

    const ghRepoName = getGHRepoName.rows[0].repo_name;

    return ghRepoName;
}

async function getGHUserCredentialInfo(pool, metaFileInfo) {
    const getGHUsername = await pool.query(`
        SELECT github_username, access_token
        FROM GitHubCredential
        WHERE id = $1
    `, [metaFileInfo.gh_account_id]);

    const ghUsername = getGHUsername.rows[0].github_username;
    const ghPAT = getGHUsername.rows[0].access_token;

    return { ghPAT, ghUsername };
}

async function getMetaFileInfo(pool, req) {
    const getFileMetaInfo = await pool.query(`
        SELECT gh_account_id, gh_repo_id, gh_filename, filename
        FROM GitHubFiles
        WHERE id = $1
    `, [req.body.id]);

    const metaFileInfo = getFileMetaInfo.rows[0];

    return metaFileInfo;
}

exports.getDownloadLink = async (req, res, pool) => {
    // Perform a look up on where the file is located remotely on GitHub
    // We need credential ID, repo ID, filename and we are given file ID
    const metaFileInfo = await getMetaFileInfo(pool, req);

    const { ghPAT, ghUsername } = await getGHUserCredentialInfo(pool, metaFileInfo);

    const ghRepoName = await getRepoName(pool, metaFileInfo);
    
    // Perform GitHub API to obtain the actual file
    const octokit = new Octokit({
        auth: ghPAT
    });

    try {
        const { data } = await getDownloadLink(octokit, ghUsername, ghRepoName, metaFileInfo.gh_filename);
        res.json(
            {
                success: true,
                message: data.download_url,
                filename: metaFileInfo.filename
            }
        );
    } catch (error) {
        res.json(
            {
                success: false,
                message: "Unable to retrieve file!"
            }
        );
        console.log(error);
    }
}

exports.getFilesPag = async (req, res, pool) => {

}

exports.replaceFile = async (req, res, pool) => {
    
}

exports.multipleDelete = async (req, res, pool) => {

}
