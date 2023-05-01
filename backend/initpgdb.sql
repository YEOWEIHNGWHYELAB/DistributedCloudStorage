/* App Tables */
CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(255) PRIMARY KEY,
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
