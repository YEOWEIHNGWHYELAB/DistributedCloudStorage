const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
var OAuth2 = google.auth.OAuth2;

// File Imports
const { getChannelVideos } = require('./youtubeapi/apicaller/crudops');

// ENV Config
const dotenv = require("dotenv");
dotenv.config();

// Configure the YouTube API client
const youtube = google.youtube({
    version: 'v3',
    auth: 'YOUR_YOUTUBE_API_KEY' // Replace with your YouTube API key
});

// Initialize the Express app
const app = express();

// Use middlewares
app.use(bodyParser.json());
app.use(cors());

/*
const sqlScriptPath = path.join(__dirname, "initpgdb.sql");
const sqlScript = fs.readFileSync(sqlScriptPath);
*/

// Set up the database connection pool
const pool = new Pool({
    user: process.env.DBUSERNAME,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});

/*
pool.connect()
  .then(() => {
    // Execute the SQL script
    pool.query(sqlScript)
      .then(() => {
        console.log('SQL initializer script executed successfully');
      })
      .catch((err) => {
        console.error('Error executing SQL script', err);
      })

    console.log(`Connected to database: ${process.env.DBNAME}`);
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });
*/

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database at', res.rows[0].now);
    }
});

// GET route for listing all videos in the user's YouTube channel
app.get('/videos', async (req, res, next) => {
    try {
        // Set up OAuth2 client
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_OA2_CLIENT_SECRET,
            process.env.GOOGLE_OA2_CLIENT_ID,
            process.env.GOOGLE_OA2_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_OA2_ACCESS_TOKEN
        });

        // Set up YouTube API client
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        // Retrieve the channel's uploads playlist ID
        youtube.channels.list({
            part: 'contentDetails',
            mine: true
        }, (err, response) => {
            if (err) {
                console.error('Error retrieving channel information:', err);
                return;
            }

            const playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;

            getChannelVideos(res, youtube, playlistId);
        });
    } catch (err) {
        next(err);
    }
});

// Update video title, description...
app.patch('/videos', async (req, res, next) => {
    try {
        // Set up OAuth2 client
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_OA2_CLIENT_SECRET,
            process.env.GOOGLE_OA2_CLIENT_ID,
            process.env.GOOGLE_OA2_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_OA2_ACCESS_TOKEN
        });

        // Set up YouTube API client
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });
        
        youtube.videos.update({
            part: 'snippet,status',
            resource: {
              id: req.body.video_id,
              snippet: {
                title: req.body.title,
                description: req.body.description,
                categoryId: 28
              }
            }
          }, function(err, data) {
            if (err) {
                res.json('Error updating video metadata: ' + err);
            } else {
                res.json('Video metadata updated: ' + data);
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST route for uploading a video to the user's YouTube channel
app.post('/videos', async (req, res, next) => {
    try {
        const { title, description, videoUrl } = req.body;
        const resource = {
            snippet: {
                title: title,
                description: description
            },
            status: {
                privacyStatus: 'private' // Change as needed
            }
        };
        const response = await youtube.videos.insert({
            auth: 'YOUR_YOUTUBE_API_KEY',
            part: 'snippet,status',
            resource: resource,
            media: {
                body: videoUrl
            }
        });
        const video = response.data;
        const queryText = 'INSERT INTO youtube_videos (video_link) VALUES ($1) RETURNING *';
        const values = [video.id];
        const result = await pool.query(queryText, values);
        const dbVideo = result.rows[0];
        res.json({
            id: dbVideo.id,
            videoUrl: `https://www.youtube.com/watch?v=${dbVideo.video_link}`,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.default.url,
            publishedAt: video.snippet.publishedAt
        });
    } catch (err) {
        next(err);
    }
});

// DELETE route for deleting list of videos
app.delete('/videos', async (req, res, next) => {
    try {
        // Set up OAuth2 client
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_OA2_CLIENT_SECRET,
            process.env.GOOGLE_OA2_CLIENT_ID,
            process.env.GOOGLE_OA2_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: process.env.GOOGLE_OA2_ACCESS_TOKEN
        });

        // Set up YouTube API client
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        youtube.videos.delete({
            id: req.body.delete_id
          }, function(err, data) {
            if (err) {
                res.json('Error deleting video: ' + err);
            } else {
                res.json('Video deleted: ' + data);
            }
        });
    } catch (err) {
        next(err);
    }
});

// Start the server
const PORT = process.env.WEBPORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
