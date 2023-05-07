/* Distributed Cloud Storage User Tables */
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_username ON Users (LOWER(username));

-- This table is for banning certain JWT only
CREATE TABLE IF NOT EXISTS JWTBlackList (
    id SERIAL PRIMARY KEY,
    token_id TEXT UNIQUE NOT NULL,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* YouTube Tables */
CREATE TABLE IF NOT EXISTS YouTubeCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    data jsonb NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* GitHub Tables */
CREATE TABLE IF NOT EXISTS GitHubCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    github_username VARCHAR(50) UNIQUE NOT NULL,
    latest_repo_id SERIAL REFERENCES GitHubRepoList(id),
    latest_file_id SERIAL UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubRepoList(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    repo_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubFiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_repo_id SERIAL REFERENCES GitHubRepoList(id),
    filename TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);