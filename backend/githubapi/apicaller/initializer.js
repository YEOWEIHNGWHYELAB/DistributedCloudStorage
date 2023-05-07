const { Octokit } = require("@octokit/rest");


async function getCredentialID(github_username, pool) {
    return await pool.query(`
        SELECT id
        FROM GitHubCredential
        WHERE github_username = $1 
    `, [github_username]);
}

exports.initializeNewCredentialRepo = async (personal_access_token, newRepoName) => {
    const octokit = new Octokit({
        auth: personal_access_token
    });

    const options = {
        name: newRepoName,
        private: true
    };
    
    return await octokit.repos.createForAuthenticatedUser(options);
}

exports.initializeNewCredentialRepoDCS = async (pool, username, newRepoName, github_username) => {
    const credIDResult = await getCredentialID(github_username, pool);

    return await pool.query(`
            INSERT INTO 
            GitHubRepoList (username, gh_account_id, repo_name) 
            VALUES ($1, $2, $3)
    `, [username,
        credIDResult.rows[0].id,
        newRepoName]);
}
