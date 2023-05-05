/* Distributed Cloud Storage User Tables */
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

/* YouTube Tables */
CREATE TABLE IF NOT EXISTS YouTubeCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    data jsonb NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS YouTubeVideo (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES Users(username),
    video_id VARCHAR(255) NOT NULL,
    video_title VARCHAR(100) NOT NULL,
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

CREATE TABLE IF NOT EXISTS GitHubDoc (
    id SERIAL PRIMARY KEY,
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    repo_id SERIAL REFERENCES GitHubRepoList(id),
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubPhoto (
    id SERIAL PRIMARY KEY,
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    repo_id SERIAL REFERENCES GitHubRepoList(id),
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS GitHubVideo (
    id SERIAL PRIMARY KEY,
    gh_account_id SERIAL REFERENCES GitHubCredential(id),
    repo_id SERIAL REFERENCES GitHubRepoList(id),
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
