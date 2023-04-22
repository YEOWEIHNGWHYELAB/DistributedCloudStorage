CREATE TABLE IF NOT EXISTS User (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS YouTubeCredential (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES User(username),
    api_key VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS YouTubeVideo (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) REFERENCES User(username),
    video_link VARCHAR(255) NOT NULL,
    published_at TIMESTAMP NOT NULL
);
