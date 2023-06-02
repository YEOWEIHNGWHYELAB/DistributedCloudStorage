/* Distributed Cloud Storage User Tables */
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_code INT,
    reset_code_expiration TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON Users (LOWER(username));

-- This table is for banning certain JWT only
CREATE TABLE IF NOT EXISTS JWTBlackList (
    id SERIAL PRIMARY KEY,
    token_id TEXT UNIQUE NOT NULL,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* SMCOverlord Directories */
CREATE TABLE IF NOT EXISTS FileSystemPaths (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    path_name VARCHAR(400) NOT NULL,
    path_level INT NOT NULL DEFAULT 1,
    path_parent BIGINT REFERENCES FileSystemPaths(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* Google Tables */
CREATE TABLE IF NOT EXISTS GoogleCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    email VARCHAR(255) UNIQUE NOT NULL,
    data jsonb NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS YouTubeVideos (
    video_id VARCHAR(255),
    username VARCHAR(255) REFERENCES Users(username),
    title VARCHAR(100) NOT NULL,
    google_account_id SERIAL REFERENCES GoogleCredential(id),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    path_dir BIGINT REFERENCES FileSystemPaths(id),
    PRIMARY KEY (video_id, username)
) PARTITION BY LIST (username);

/* GitHub Tables */
CREATE TABLE IF NOT EXISTS GitHubCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    github_username VARCHAR(50) UNIQUE NOT NULL,
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
    id BIGSERIAL,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_repo_id SERIAL REFERENCES GitHubRepoList(id),
    gh_filename BIGINT NOT NULL,
    filename TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    path_dir BIGINT REFERENCES FileSystemPaths(id),
    PRIMARY KEY (id, username)
) PARTITION BY LIST (username);

/*
 This table tracks the latest usable file ID, repo ID and credential ID 
 the user could upload the next file using...
 
 Each user should only have 1 GitHubFID per account they own!
 
 To decide what the next file should be uploaded to and what it should 
 be named, do note that we should consider which account to upload the 
 file to depends all the accounts storage, we could take the minimum 
 storage account for instance
 
 gh_file_uid should only be incremented upon uploading new files
 */
CREATE TABLE IF NOT EXISTS GitHubFID (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_repo_id SERIAL REFERENCES GitHubRepoList(id),
    gh_file_uid BIGINT DEFAULT 1 NOT NULL
);

/* 
 One account will have a total storage and its latest "working" repo's
 storage to in it
 */
CREATE TABLE IF NOT EXISTS GitHubAccountStorage (
    id SERIAL PRIMARY KEY,
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    gh_storage BIGINT DEFAULT 0 NOT NULL,
    gh_latest_repo_storage INT DEFAULT 0 NOT NULL
);