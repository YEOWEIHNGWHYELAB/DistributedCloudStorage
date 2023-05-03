const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GH_ACCESS_TOKEN
});


const owner = process.env.GH_USERNAME;
const repo = "Documents-Test";
const filePath = "test.pdf";
const ghPath = "pdf/test.pdf"
const branch = "main"; // replace with the name of the branch you want to write to

async function uploadFile() {
  try {
    const fileContent = fs.readFileSync(filePath);
    const encodedContent = Buffer.from(fileContent).toString("base64");

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: ghPath,
      message: "Add new file pdf, docx, xlsx,...", // commit message
      content: encodedContent, // file content in base64 format
      committer: {
        name: process.env.GH_USERNAME,
        email: process.env.GH_EMAIL
      },
      branch: branch
    });
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

uploadFile();
