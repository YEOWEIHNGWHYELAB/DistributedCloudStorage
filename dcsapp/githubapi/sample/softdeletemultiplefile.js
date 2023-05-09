const dotenv = require("dotenv");
dotenv.config();

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});

const owner = process.env.GH_USERNAME;
const repo = "Documents-Test";
const paths = ["pdf/pp1.pptx", "pdf/pp2.pptx", "pdf/pp3.pptx"];
const message = "Delete multiple files";
const branch = "main";

// Deletion of files using multiple commits
async function deleteFilesUsingMultipleCommits() {
    try {
        for (const path of paths) {
            const { data } = await octokit.repos.getContent({
                owner: owner,
                repo: repo,
                path: path
            });

            const sha = data.sha;

            await octokit.repos.deleteFile({
                owner: owner,
                repo: repo,
                path: path,
                message: message,
                sha: sha,
                branch: branch
            });

            console.log(`Successfully Deleted: ${path}`)
        }

        console.log("Completed Deletion!");
    } catch (error) {
        console.log(error);
    }
}

deleteFilesUsingMultipleCommits();
