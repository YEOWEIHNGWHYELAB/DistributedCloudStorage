const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const auth = require('./auth/apicaller/auth');
var OAuth2 = google.auth.OAuth2;

// File Imports
const { getChannelVideoByToken, getChannelAllVideos } = require('./youtubeapi/apicaller/ytvideolist');

// ENV Config
const dotenv = require("dotenv");
dotenv.config();

// Initialize the Express app
const app = express();

// Use middlewares
app.use(bodyParser.json());
app.use(cors());

// Temporary storage
const multer = require('multer');
const tempstorage = multer({ dest: 'tempstorage/' });

// Set up the database connection pool
const pool = new Pool({
    user: process.env.DBUSERNAME,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});

// Initialize PG DB
const sqlScriptPath = path.join(__dirname, "./dbmanager/initializedb/initpgdb.sql");
const sqlScript = fs.readFileSync(sqlScriptPath, "utf-8");
const pgDBInitializer = require('./dbmanager/initializedb/initpgdb');
pgDBInitializer.initpgdb(pool, sqlScript);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database at', res.rows[0].now);
    }
});

/**
 * Authentication for DCS
 */
// Authentication Routing
const authRouter = require('./auth/routes/authroutes')(pool);
app.use('/auth', authRouter);


/**
 * GitHub DCS
 */
// GitHub Credential Routers
const githubCredentialsRouter = require('./githubapi/routes/credentialroutes')(pool);
app.use('/github', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, githubCredentialsRouter);

// GitHub Files Routers
const githubMyFilesRouter = require('./githubapi/routes/myfilesroutes')(pool);
app.use('/github', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, githubMyFilesRouter);

// GitHub Account Stat
const githubAccountStatRouter = require('./githubapi/routes/accountstatroutes')(pool);
app.use('/github', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, githubAccountStatRouter);


/**
 * Google Drive & YouTube DCS
 */
// Google Credentials Route


// Youtube Videos Routers
const youtubeVideosRoute = require('./youtubeapi/routes/ytvideoroutes')(pool);
app.use('youtube', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, youtubeVideosRoute)

// Youtube Direct Routers

// GET route for listing all videos in the user's YouTube channel
app.get('/youtube', auth.isAuthenticated, async (req, res, next) => {
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

            console.log(req.body);

            const playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;

            if (req.body.pageToken != null) {
                getChannelVideoByToken(res, youtube, playlistId, req.body.maxVideo, req.body.pageToken);
            } else {
                getChannelAllVideos(res, youtube, playlistId, 50);
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET route for listing all videos in the user's YouTube channel
app.post('/youtube2', auth.isAuthenticated, async (req, res, next) => {
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

            console.log(req.body);

            const playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;

            if (req.body.pageToken != null) {
                getChannelVideoByToken(res, youtube, playlistId, req.body.maxVideo, req.body.pageToken);
            } else {
                getChannelAllVideos(res, youtube, playlistId, 50);
            }
        });
    } catch (err) {
        next(err);
    }
});

// Update video title, description...
app.patch('/youtube', async (req, res, next) => {
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
        }, function (err, data) {
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
app.post('/youtube', tempstorage.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res, next) => {
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

        const { path: videoPath, originalname: videoName } = req.files['video'][0];
        const { path: thumbnailPath, originalname: thumbnailName } = req.files['thumbnail'][0];

        const videoStream = fs.createReadStream(videoPath);
        const thumbnailStream = fs.createReadStream(thumbnailPath);

        const response = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: req.headers.title,
                    description: req.headers.description
                },
                status: {
                    privacyStatus: req.headers.privacy_status
                }
            },
            media: {
                body: videoStream
            }
        }, async function (err, data) {
            if (err) {
                res.json('Error uploading video: ' + err);
            } else {
                // Clean up the uploaded file
                fs.unlinkSync(videoPath);

                // Upload thumbnails
                const video = data.data;
                const videoID = data.data.id;

                const thumbnailResponse = await youtube.thumbnails.set({
                    videoID,
                    media: {
                        mimeType: 'image/png',
                        body: thumbnailStream
                    }
                }, async function () {
                    fs.unlinkSync(thumbnailPath);

                    const queryText = 'INSERT INTO YouTubeVideo (username, video_id, video_title) VALUES ($1, $2, $3) RETURNING *';
                    const values = ["whyelab", video.id, video.snippet.title];
                    const result = await pool.query(queryText, values);

                    res.json({
                        videoUrl: `https://www.youtube.com/watch?v=${videoID}`,
                        title: video.snippet.title,
                        description: video.snippet.description,
                        thumbnail: video.snippet.thumbnails.default.url,
                        publishedAt: video.snippet.publishedAt,
                        database_status: result
                    });
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

// DELETE route for deleting a single video
app.delete('/youtube', async (req, res, next) => {
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
        }, function (err, data) {
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
