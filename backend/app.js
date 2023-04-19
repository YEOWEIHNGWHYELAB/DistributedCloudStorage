const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { google } = require('googleapis');
const path = require('path');

require('dotenv').config();

// Initialize Express app
const app = express();

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Create a pool of database connections
const pool = new Pool({
  user: process.env.DBUSERNAME,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
});

// Google OAuth2 credentials and scopes
const CLIENT_ID = process.env.GOOEGLE_OA2_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOEGLE_OA2_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOEGLE_OA2_REDIRECT_URI;
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

// YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: null,
});

// OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  `${REDIRECT_URI}/auth/google/callback`
);

// Get authorization URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/*
// Endpoint to handle video uploads
app.post('/videos', upload.single('video'), (req, res) => { 
  oauth2Client.setCredentials(req.user.tokens);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const video = {
    media: {
      body: fs.createReadStream(req.file.path),
    },
    part: 'snippet,status',
    notifySubscribers: false,
  };

  youtube.videos.insert(
    {
      auth: oauth2Client,
      resource: video,
      media: video.media,
      part: video.part,
    },
    (err, data) => {
      if (err) {
        console.error('Error uploading video:', err);
        res.status(500).json({ message: 'Error uploading video' });
        return;
      }

      console.log('Video upload successful:', data);

      // Save the video ID to the database
      const videoId = data.data.id;
      db.query('INSERT INTO videos (user_id, video_id) VALUES ($1, $2)', [req.user.id, videoId])
        .then(() => {
          res.status(200).json({ message: 'Video upload successful' });
        })
        .catch((error) => {
          console.error('Error saving video ID to database:', error);
          res.status(500).json({ message: 'Error saving video ID to database' });
        });
    }
  );
});
*/


// Endpoint to retrieve a list of videos for a user from the database
app.get('/videos/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve all videos for the specified user from the database
    const result = await pool.query('SELECT * FROM videos WHERE user_id = $1', [userId]);

    // Map the rows to an array of video URLs
    const videos = result.rows.map((row) => row.url);

    res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Endpoint to retrieve all videos for a user from YouTube
app.get('/youtube/videos', async (req, res) => {
  try {
    // Check if the request includes an "Authorization" header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).send('Unauthorized');
    }

    // Get the access token from the "Authorization" header
    const accessToken = authHeader.replace('Bearer ', '');

    // Set the access token on the OAuth2 client
    oAuth2Client.setCredentials({ access_token: accessToken });

    // Retrieve the user's channel ID
    const { data: channelsResponse } = await youtube.channels.list({
      auth: oAuth2Client,
      mine: true,
      part: 'id',
    });
    const channelId = channelsResponse.items[0].id;

    // Retrieve all videos for the user's channel
    const videos = [];
    let nextPageToken;
    do {
      const { data: playlistItemsResponse } = await youtube.playlistItems.list({
        auth: oAuth2Client,
        part: 'snippet',
        maxResults: 50,
        playlistId: 'UU' + channelId.substr(2), // User's channel ID with the "UC" prefix replaced by "UU"
        pageToken: nextPageToken,
      });
      videos.push(...playlistItemsResponse.items);
      nextPageToken = playlistItemsResponse.nextPageToken;
    } while (nextPageToken);

    // Map the videos to an array of video URLs
    const videoUrls = videos.map((video) => `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`);

    res.status(200).json(videoUrls);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Start the Express app
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
