const dotenv = require("dotenv");
dotenv.config();

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});

const owner = process.env.GH_USERNAME;
const repo = "Documents-Test";
const ghPath = "pdf/lalalla.xlsx";
const message = "Delete file";
const branch = "main";

async function deleteFile() {
    try {
        // Again you need to make sure that you are on the correct 
        // commit sha digest before you can even perform deletion 
        const { data } = await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath,
            branch: branch
        });

        const sha = data.sha;

        await octokit.repos.deleteFile({
            owner: owner,
            repo: repo,
            path: ghPath,
            message: message,
            sha: sha,
            branch: branch
        });
    } catch (error) {
        console.log(error);
    }
}

deleteFile();
