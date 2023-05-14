const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;


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

function setUpOAuth2ClientAccessToken(client_id, client_secret, redirect_url) {
    // Initialize the OAuth2Client
    const oauth2Client = new OAuth2Client(
        client_id, // CLIENT_ID
        client_secret, // CLIENT_SECRET
        redirect_url // REDIRECT_URL
    );

    return oauth2Client;
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

async function uploadVideo(youtube, req, videoStream, res, videoPath, thumbnailStream, thumbnailPath, pool, username, account_id) {
    return await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: req.headers.title,
                description: req.body.description
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
            // console.log(err);
            res.json({ success: false, message: "Failed to upload!" });
        } else {
            // Clean up the uploaded file
            fs.unlinkSync(videoPath);

            // Upload thumbnails
            const video = data.data;
            const videoID = video.id;

            const thumbnailResponse = await youtube.thumbnails.set({
                videoID,
                media: {
                    mimeType: 'image/png',
                    body: thumbnailStream
                }
            }, async function () {
                fs.unlinkSync(thumbnailPath);

                const queryText = 'INSERT INTO YouTubeVideos (username, video_id, title, google_account_id) VALUES ($1, $2, $3, $4) RETURNING *';
                const values = [username, videoID, video.snippet.title, account_id];
                const result = await pool.query(queryText, values);

                res.json({
                    success: true,
                    message: "Video uploaded successfully",
                    results: `https://www.youtube.com/watch?v=${videoID}`,
                    title: video.snippet.title
                });
            });
        }
    });
}

// Wrap the refreshAccessToken function in a promise
function refreshAccessToken(oauth2ClientAccessTokenGetter) {
    return new Promise((resolve, reject) => {
        oauth2ClientAccessTokenGetter.refreshAccessToken((err, token) => {
            if (err) {
                // reject(err);
                res.json({ success: false, message: "Failed to get token!" });
            } else {
                resolve(token);
            }
        });
    });
}

// Upload new video
exports.uploadVideo = async (req, res, pool, mongoYTTrackCollection) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Decide which credentials to use
    const currentDate = moment().format('DDMMYYYY');

    // Key for the monogo YouTubeStatLog
    const keyStatLog = `${decoded.username}_${currentDate}`;

    // Obtaining all the available credentials from the account
    const selectQueryCredential = `
        SELECT id, email, data
        FROM GoogleCredential
        WHERE username = $1
    `;
    const queryCredential = await pool.query(selectQueryCredential, [decoded.username]);

    // Credential ID that will be used
    let credentialIDUsed;

    let existingCurrentYTLog = await mongoYTTrackCollection.findOne({ _id: keyStatLog });
    if (existingCurrentYTLog != null) {
        // Update the existing document, note that there could be new 
        // credentials added, but we will keep it simple and use that 
        // tomorrow instead
        let minDailyUpload = Number.MAX_VALUE;
        let minCred;

        for (let currCred of existingCurrentYTLog.yt_log) {
            if (minDailyUpload > currCred.count) {
                minDailyUpload = currCred.count;
                credentialIDUsed = currCred.id;
                minCred = currCred;
            }
        }

        minCred.count++;

        const queryID = { _id: keyStatLog };
        const updateQuery = { $set: { yt_log: existingCurrentYTLog.yt_log } };

        const result = await mongoYTTrackCollection.updateOne(queryID, updateQuery);
    } else {
        // Creating the new logging document to insert to the mongoDB 
        let valueStatLog = queryCredential.rows;
        let hasRan = false;
        let newStatLog = [];

        for (let currCred of valueStatLog) {
            // We will just pick the first entry if no uploads have been 
            // performed today
            if (!hasRan) {
                credentialIDUsed = currCred.id;
                newStatLog.push({ id: credentialIDUsed, count: 1 });
                hasRan = true;
                continue;
            }

            newStatLog.push({ id: currCred.id, count: 0 });
        }

        const ytUploadStatLogDoc = {
            _id: keyStatLog,
            yt_log: newStatLog
        };

        mongoYTTrackCollection.insertOne(ytUploadStatLogDoc);
    }

    let emailToUsed;
    let credentialInfoUsed;

    for (let currCreden of queryCredential.rows) {
        if (currCreden.id == credentialIDUsed) {
            emailToUsed = currCreden.email;
            credentialInfoUsed = currCreden.data;
        }
    }

    // Obtain temporary access token
    const oauth2ClientAccessTokenGetter = setUpOAuth2ClientAccessToken(credentialInfoUsed.yt_client_id, credentialInfoUsed.yt_client_secret, credentialInfoUsed.yt_redirect_uris);

    // Set the refresh token on the OAuth2Client
    oauth2ClientAccessTokenGetter.setCredentials({
        refresh_token: credentialInfoUsed.yt_refresh_token,
    });

    const tempAccess = await refreshAccessToken(oauth2ClientAccessTokenGetter);
    const tempAccessToken = tempAccess.access_token;

    // Perform actual upload
    try {
        // Set up OAuth2 client
        const oauth2Client = setUpOAuth2Client(credentialInfoUsed.yt_client_id, credentialInfoUsed.yt_client_secret, credentialInfoUsed.yt_redirect_uris, tempAccessToken);

        // Set up YouTube API client
        const youtube = setUpYTAPIClient(oauth2Client);

        const { path: videoPath, originalname: videoName } = req.files['video'][0];
        const { path: thumbnailPath, originalname: thumbnailName } = req.files['thumbnail'][0];

        const videoStream = fs.createReadStream(videoPath);
        const thumbnailStream = fs.createReadStream(thumbnailPath);

        // const videoNameActual = path.basename(videoName, path.extname(videoName));
        // const thumbnailNameActual = path.basename(thumbnailName, path.extname(thumbnailName));

        const response = await uploadVideo(youtube, req, videoStream, res, videoPath, thumbnailStream, thumbnailPath, pool, decoded.username, credentialIDUsed);
    } catch (err) {
        // console.log(err);
        // next(err);
        res.json({ success: false, message: "Failed to upload!" });
    }
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
