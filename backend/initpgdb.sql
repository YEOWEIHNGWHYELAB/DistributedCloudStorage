/* Distributed Cloud Storage User Tables */
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- This table is for banning certain JWT only
CREATE TABLE IF NOT EXISTS JWTBlackList (
    id SERIAL PRIMARY KEY,
    token_id TEXT NOT NULL,
    revoked_at TIMESTAMP DEFAULT NOW()
);

/* YouTube Tables */
CREATE TABLE IF NOT EXISTS YouTubeCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    data jsonb NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

/* GitHub Tables */
CREATE TABLE IF NOT EXISTS GitHubCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    github_username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubRepoList(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    repo_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
