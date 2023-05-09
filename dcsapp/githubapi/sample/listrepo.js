const dotenv = require("dotenv");
dotenv.config();

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GH_ACCESS_TOKEN
});

async function getAllRepositories() {
  const repositories = await octokit.repos.listForAuthenticatedUser();
  return repositories.data;
}

getAllRepositories().then(repositories => {
  console.log(repositories);
}).catch(err => {
  console.log(err);
});
