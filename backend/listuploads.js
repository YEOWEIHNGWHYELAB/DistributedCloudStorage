var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

const TOKEN_DIR = 'C:\\Users\\WHYELAB\\.credentials\\';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('./client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  credentials = JSON.parse(content);

  // Set up OAuth2 client
  const oauth2Client = new OAuth2(
    credentials.web.client_secret,
    credentials.web.client_id,
    credentials.web.redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, function processClientToken(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }

    oauth2Client.setCredentials({
      access_token: JSON.parse(content).access_token
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

      // Retrieve the videos in the uploads playlist
      youtube.playlistItems.list({
        part: 'snippet',
        maxResults: 50,
        playlistId: playlistId
      }, (err, response) => {
        if (err) {
          console.error('Error retrieving playlist items:', err);
          return;
        }

        const videos = response.data.items.map(item => ({
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          thumbnailUrl: item.snippet.thumbnails.default.url
        }));

        console.log(videos);
      });
    });
  });
});
