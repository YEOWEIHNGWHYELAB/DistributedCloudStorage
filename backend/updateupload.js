var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// You will need a different scope for this purpose: https://www.googleapis.com/auth/youtube.force-ssl
// READ: https://developers.google.com/youtube/v3/guides/auth/installed-apps

const TOKEN_DIR = 'C:\\Users\\WHYELAB\\.credentials\\';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart-delete.json';

// video category IDs for YouTube:
const categoryIds = {
  Entertainment: 24,
  Education: 27,
  ScienceTechnology: 28
}

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
    
    youtube.videos.update({
        part: 'snippet,status',
        resource: {
          id: "LMk8wnP7FUs",
          snippet: {
            title: 'YouTube Upload Video API Test',
            description: 'Testing YouTube upload video using API for WHYELAB',
            categoryId: categoryIds.ScienceTechnology,
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en'
          }
        }
      }, function(err, data) {
        if (err) {
          console.error('Error updating video metadata: ' + err);
        } else {
          console.log('Video metadata updated: ' + data);
        }
    });
  });
});
