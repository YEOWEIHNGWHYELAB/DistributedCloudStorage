const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require('moment');


// Check if the auth header exist from DCS
function checkAuthHeader(authHeader, res) {
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    return token = authHeader.split(" ")[1];
}

function decodeAuthToken(dcsAuthToken, res) {
    try {
        let decoded = jwt.verify(dcsAuthToken, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
        return decoded;
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

function setUpOAuth2Client(clientSecret, clientID, redirectURI, accessToken) {
    const oauth2Client = new OAuth2(
        clientSecret,
        clientID,
        redirectURI
    );

    oauth2Client.setCredentials({
        access_token: accessToken
    });

    return oauth2Client;
}

function setUpYTAPIClient(oauth2Client) {
    return google.youtube({
        version: 'v3',
        auth: oauth2Client
    });
}

// Upload new video
exports.uploadVideo = async (req, res, pool, mongoYTTrackCollection) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Obtaining all the available credentials from the account
    const selectQueryCredential = `
        SELECT * 
        FROM GoogleCredential
        WHERE username = $1
    `;
    const queryCredential = await pool.query(selectQueryCredential, [decoded.username]);

    // Decide which credentials to use
    const currentDate = moment().format('DDMMYYYY');
    const ytUploadStatLogDoc = {
        key: `${decoded.username}_${currentDate}`,
        value:
            [
                {
                    credentials: 'a321321bc',
                    ids: 'abc'
                },
                {
                    credentials: '123abc',
                    ids: '123abc'
                }
            ]
            
    };

    // mongoYTTrackCollection.insertOne(ytUploadStatLogDoc);

    // mongoClientDB.collection().insertOne();
    //console.log(mongoClientDB);
    // mongoClientDB.connection(process.env.MONGOYTTRACK);

    // Insert the document into the collection
    //const result = await mongoClient.insertOne(ytUploadStatLogDoc);
    //console.log('Document inserted successfully:', result.insertedId);

    /*
  try {
      // Set up OAuth2 client
      const oauth2Client = setUpOAuth2Client();

      // Set up YouTube API client
      const youtube = setUpYTAPIClient(oauth2Client);

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
      console.log(err);
      res.json({ success: false, message: "Failed to upload!"});
      next(err);
  }
  */
};

exports.getVideosPag = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);
};

// Edit video meta data
exports.editVideoMeta = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

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
        // console.log(err);
        res.json(
            {
                success: false,
                message: "Failed to update!"
            }
        );
    }
};


// Soft Delete selected video
exports.deleteVideoSoft = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);


}


// HARD DELETE a selected video
// WARNING: THERES NO TURNING BACK!
exports.deleteVideoHard = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

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
};
