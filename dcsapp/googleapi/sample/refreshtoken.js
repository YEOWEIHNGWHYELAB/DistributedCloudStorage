// This is a test site that lets you test the refresh token along with the token generated
// Simply host this at the set redirect url you stated on your google API say "localhost:3600"
// When you start the app, it will ask you to authenticate using your Google OAuth2 and after 
// that you will be redirected to the stated redirect URL and then if it is successfully, you 
// will see Authorization successful on the page and then you will see the refresh token.
// Then if you go to "localhost:3600/i" you should be able to see "Refresh successful!" if its
// successful. Then you will see the new generated token at the console.

const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { google } = require('googleapis');
const express = require('express');
const app = express();

let refreshToken;

// Initialize the OAuth2Client
const oauth2Client = new OAuth2Client(
  '', // CLIENT_ID
  '', // CLIENT_SECRET
  ''); // REDIRECT_URL

// Generate the authorization URL with the YouTube scope
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/youtube', // Request YouTube scope
});

// Redirect the user to the authorization URL
console.log('Please visit the following URL to authorize the application with full YouTube access:');
console.log(authUrl);

app.get('/i', async (req, res) => {
  // Set the refresh token on the OAuth2Client
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  // Refresh the access token
  oauth2Client.refreshAccessToken((err, tokens) => {
    if (err) {
      console.error('Failed to refresh access token:', err);
      return;
    }

    // Extract the new access token
    const accessToken = tokens.access_token;
    console.log(accessToken);

    // Continue with your application logic
    res.send('Refresh successful!');
  });
});


// Handle the callback after the user grants authorization
// This route should be set as your REDIRECT_URL in the Google API Console
app.get('/', async (req, res) => {
  const code = req.query.code;
  const scope = req.query.scope;

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Extract the refresh token from the response
    refreshToken = tokens.refresh_token;

    // Store the refresh token securely in your application's backend or database

    // Set the access token and refresh token for the OAuth2 client
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: refreshToken,
    });

    // Create a YouTube Data API client
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Example API request to retrieve the user's YouTube playlists
    const response = await youtube.playlists.list({
      mine: true,
      part: 'snippet',
    });

    // Process the API response
    console.log(response.data);

    console.log("=========================================================================");

    console.log(refreshToken);

    // Continue with your application logic
    res.send('Authorization successful!');
  } catch (error) {
    console.error('Failed to exchange authorization code for tokens:', error);
    res.status(500).send('Failed to authorize the application.');
  }
});

// Start the server
const PORT = 3600;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
