const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});

const owner = process.env.GH_USERNAME;
const repo = "Documents-Test";
const filePath = "test.pdf"; // replace with the actual path to your file
const ghPath = "pdf/test.pdf";
const branch = "main"; // replace with the name of the branch you want to write to

async function updateFile() {
    try {
        // You will need to retrieve the latest commit sha digest so that you ensure 
        // you are updating on the right commit
        const { data } = await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: ghPath,
            branch: branch
        });

        const fileContent = fs.readFileSync(filePath);
        const encodedContent = Buffer.from(fileContent).toString("base64");

        await octokit.repos.createOrUpdateFileContents({
            owner: owner,
            repo: repo,
            path: ghPath,
            message: "Update PDF stuff",
            content: encodedContent,
            committer: {
                name: process.env.GH_USERNAME,
                email: process.env.GH_EMAIL
            },
            sha: data.sha,
            branch: branch
        });

        console.log("File updated successfully");
    } catch (error) {
        console.log(error);
    }
}

updateFile();
