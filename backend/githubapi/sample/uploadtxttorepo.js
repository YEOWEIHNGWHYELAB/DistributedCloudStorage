const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});

const owner = process.env.GH_USERNAME;
const repo = "Text-Notes";
const path = "test.txt";
const fileContent = fs.readFileSync(path);
const branch = "main";

const ghPath = "test/test.txt"

async function uploadFile() {
    try {
        const { data } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: owner,
            repo: repo,
            path: ghPath,
            message: "Added testing text to Repo", // commit message
            committer: {
                name: process.env.GH_USERNAME,
                email: process.env.GH_EMAIL
            },
            content: fileContent.toString("base64"), // convert file content to base64
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            },
            branch: branch
          })
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

uploadFile();
