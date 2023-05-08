const { Octokit } = require("@octokit/rest");


async function getCredentialID(github_username, pool) {
    return await pool.query(`
        SELECT id
        FROM GitHubCredential
        WHERE github_username = $1 
    `, [github_username]);
}

async function getRepoID(github_account_id, repo_name, pool) {
    return await pool.query(`
        SELECT id
        FROM GitHubRepoList
        WHERE gh_account_id = $1 AND
            repo_name = $2
    `, [github_account_id, repo_name]);
}

async function getLatestFID(username, pool) {
    return await pool.query(`
        SELECT id
        FROM GitHubFID
        WHERE username = $1
    `, [username]);
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

    const ghRepoInitializer = await pool.query(`
            INSERT INTO 
            GitHubRepoList (username, gh_account_id, repo_name) 
            VALUES ($1, $2, $3)
    `, [username,
        credIDResult.rows[0].id,
        newRepoName]);

    return credIDResult.rows[0].id;
}

exports.initializeNewCredentialForFileIDUsage = async (pool, username, credIDResult) => {
    const repoID = await getRepoID(credIDResult, github_repo_name, pool);
    const latestFID = await getLatestFID(username, pool);

    if (latestFID.rows[0] == null) {
        return await pool.query(`
            INSERT INTO 
            GitHubFID (username, gh_account_id, gh_repo_id) 
            VALUES ($1, $2, $3)
        `, [username,
            credIDResult,
            repoID]);
    }

    return await pool.query(`
        UPDATE GitHubFID
        SET gh_account_id = $2, gh_repo_id = $3
        WHERE username = $1
    `, [username,
        credIDResult,
        repoID]);
}

exports.initalizeNewStorageTrack = async (pool, credIDResult) => {
    return await pool.query(`
        INSERT INTO
        GitHubAccountStorage (gh_account_id)
        VALUES ($1)`, [credIDResult]);
}
