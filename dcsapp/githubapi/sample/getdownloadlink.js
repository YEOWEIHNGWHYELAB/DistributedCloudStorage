const dotenv = require("dotenv");
dotenv.config();

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});

const owner = process.env.GH_USERNAME;
const repo = "Documents-Test";
const ghPath = "pdf/test.pdf";

async function getDownloadLink() {
    try {
        const { data } = await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath
        });

        const downloadUrl = data.download_url;

        console.log(downloadUrl);
    } catch (error) {
        console.log(error);
    }
}

// Note that the download link will have a token on it and 
// this token changes with time
getDownloadLink();
