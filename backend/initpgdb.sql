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
    latest_file_id SERIAL UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubRepoList (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL NOT NULL REFERENCES GitHubCredential(id),
    repo_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* 
    We did not restrict filenames to be unique since we are going to 
    categorize these files in a custom file table which we could have
    several folders and each of these folder could have the files with 
    the same name!
*/ 
CREATE TABLE IF NOT EXISTS GitHubFiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_repo_id SERIAL REFERENCES GitHubRepoList(id),
    filename TEXT NOT NULL, 
    gh_filename SERIAL NOT NULL, 
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(username, gh_filename)
);

/*
    Each user should only have 1 GitHubFID entry 

    To decide what the next file should be uploaded to and what it should 
    be named, do note that we should consider which account to upload the 
    file to depends all the accounts storage, we could take the minimum 
    storage account for instance
*/
CREATE TABLE IF NOT EXISTS GitHubFID (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_repo_id SERIAL REFERENCES GitHubRepoList(id),
    gh_file_uid BIGINT DEFAULT 1 NOT NULL
);