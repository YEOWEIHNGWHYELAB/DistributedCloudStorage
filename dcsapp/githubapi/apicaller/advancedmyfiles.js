const jwt = require("jsonwebtoken");
const fetch = require('node-fetch');
const { Octokit } = require("@octokit/rest");
const fs = require("fs");


exports.getDownloadLink = async (req, res, pool) => {
    // Perform a look up on where the file is located remotely on GitHub
    

    // Perform GitHub API to obtain the actual file
    const octokit = new Octokit({
        auth: process.env.GH_ACCESS_TOKEN
    });

    try {
        const { data } = await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath
        });

        const downloadUrl = data.download_url;

        res.json(
            {
                success: true,
                message: `Successfully renamed file!`
            }
        );
    } catch (error) {
        console.log(error);
    }
}

exports.getFilesPag = async (req, res, pool) => {

}

exports.replaceFile = async (req, res, pool) => {
    
}

exports.multipleDelete = async (req, res, pool) => {
    
}
