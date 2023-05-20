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

async function uploadCompletion(videoPath, data, thumbnailStream, thumbnailPath, youtube, username, account_id, pool, res) {
    // Clean up the uploaded file
    fs.unlinkSync(videoPath);

    // Upload thumbnails
    const video = data.data;
    const videoID = video.id;

    if (thumbnailStream != null && thumbnailPath != null) {
        const thumbnailResponse = await youtube.thumbnails.set({
            videoId: videoID,
            media: {
                body: thumbnailStream
            }
        }, async function () {
            fs.unlinkSync(thumbnailPath);

            const queryText = `INSERT INTO YouTubeVideos_${username} (username, video_id, title, google_account_id) VALUES ($1, $2, $3, $4) RETURNING *`;
            const values = [username, videoID, video.snippet.title, account_id];
            const result = await pool.query(queryText, values);
        });
    } else {
        const queryText = `INSERT INTO YouTubeVideos_${username} (username, video_id, title, google_account_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [username, videoID, video.snippet.title, account_id];
        const result = await pool.query(queryText, values);
    }
}

async function uploadVideo(youtube, req, videoStream, res, videoPath, thumbnailStream, thumbnailPath, pool, username, account_id, videoName, isLastVideo) {
    let videoTitle = videoName;
    let videoDescription = "";

    if (req.header.title != null) {
        videoTitle = req.headers.title;
    }

    if (req.body.description != null) {
        videoDescription = req.body.description;
    }

    try {
        const responseInsert = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription
                },
                status: {
                    privacyStatus: req.headers.privacy_status
                }
            },
            media: {
                body: videoStream
            }
        });

        const responseComplete = await uploadCompletion(videoPath, data, thumbnailStream, thumbnailPath, youtube, username, account_id, pool, res);
    } catch (err) {
        throw new Error(err);
    }
}

// Wrap the refreshAccessToken function in a promise
function refreshAccessToken(oauth2ClientAccessTokenGetter) {
    return new Promise((resolve, reject) => {
        oauth2ClientAccessTokenGetter.refreshAccessToken((err, token) => {
            if (err) {
                reject("Failed to get token!");
                res.json({ success: false, message: "Failed to get token!" });
            } else {
                resolve(token);
            }
        });
    });
}

// Upload new video
exports.uploadVideo = async (file, req, res, pool, mongoYTTrackCollection) => {
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

        let videoName;
        let videoPath;
        let thumbnailName;
        let thumbnailPath;

        if (file != null) {
            videoName = file.originalname;
            videoPath = file.path;
            thumbnailName = null;
            thumbnailPath = null;
        } else {
            videoPath = req.files['video'][0].path;
            videoName = req.files['video'][0].originalname;
            thumbnailPath = req.files['thumbnail'][0].path;
            thumbnailName = req.files['thumbnail'][0].originalname;
        }

        const videoStream = fs.createReadStream(videoPath);

        // const videoNameActual = path.basename(videoName, path.extname(videoName));
        // const thumbnailNameActual = path.basename(thumbnailName, path.extname(thumbnailName));

        if (thumbnailPath != null) {
            const thumbnailStream = fs.createReadStream(thumbnailPath);
            const response = await uploadVideo(youtube, req, videoStream, res, videoPath, thumbnailStream, thumbnailPath, pool, decoded.username, credentialIDUsed, videoName);
        } else {
            const response = await uploadVideo(youtube, req, videoStream, res, videoPath, null, null, pool, decoded.username, credentialIDUsed, videoName);
        }
    } catch (err) {
        throw new Error(err);
    }
};

exports.getVideosPag = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtain video credential ID
    let videoPaginatedQuery = `
        SELECT video_id, title, created_at
        FROM YouTubeVideos_${decoded.username}
        WHERE username = $1 
            AND is_deleted = false 
    `;

    if (req.body.search && req.body.search.trim() !== "") {
        videoPaginatedQuery += `AND title ILIKE '%${req.body.search.trim()}%' `;
    }

    videoPaginatedQuery += `LIMIT $2 OFFSET $3`;

    const queryPageCount = `
        SELECT COUNT(id) AS num_files
        FROM GitHubFiles
        WHERE username = $1 AND is_deleted = false
    `;

    try {
        const videoPagResult = await pool.query(videoPaginatedQuery, [decoded.username, limit, offset]);
        const queryPageCountResult = await pool.query(queryPageCount, [
            decoded.username,
        ]);

        res.json(
            {
                success: true,
                message: "Videos obtained successfully",
                results: videoPagResult.rows,
                maxpage: Math.ceil(queryPageCountResult.rows[0].num_files / limit)
            }
        );
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to get videos" });
    }
};

// Edit video meta data
exports.editVideoMeta = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Obtain video credential ID
    const videoCredID = `
        SELECT google_account_id
        FROM YouTubeVideos_${decoded.username}
        WHERE username = $1 AND video_id = $2
    `;
    const videoIDQuery = await pool.query(videoCredID, [decoded.username, req.body.video_id]);
    const videoGoogleCredID = videoIDQuery.rows[0].google_account_id;

    // Obtaining all the available credentials from the account
    const selectQueryCredential = `
        SELECT id, email, data
        FROM GoogleCredential
        WHERE username = $1
    `;
    const queryCredential = await pool.query(selectQueryCredential, [decoded.username]);

    let credentialData;

    for (let currCred of queryCredential.rows) {
        if (videoGoogleCredID == currCred.id) {
            credentialData = currCred.data;
            break;
        }
    }

    // Obtain temporary access token
    const oauth2ClientAccessTokenGetter = setUpOAuth2ClientAccessToken(credentialData.yt_client_id, credentialData.yt_client_secret, credentialData.yt_redirect_uris);

    // Set the refresh token on the OAuth2Client
    oauth2ClientAccessTokenGetter.setCredentials({
        refresh_token: credentialData.yt_refresh_token,
    });

    const tempAccess = await refreshAccessToken(oauth2ClientAccessTokenGetter);
    const tempAccessToken = tempAccess.access_token;

    const updateQueryVideo = `
        UPDATE YouTubeVideos_${decoded.username}
        SET title = $2
        WHERE username = '${decoded.username}'
            AND video_id = $1
    `;

    try {
        // Set up OAuth2 client
        const oauth2Client = new OAuth2(
            credentialData.yt_client_secret,
            credentialData.yt_client_id,
            credentialData.yt_redirect_uris
        );

        oauth2Client.setCredentials({
            access_token: tempAccessToken
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
        }, async function (err, data) {
            if (err) {
                // console.log(err);
                res.json({ success: false, message: "Error updating video metadata" });
            } else {
                const updatedVideo = await pool.query(updateQueryVideo, [req.body.video_id, req.body.title]);
                res.json({ success: true, message: "Successfully updated video metadata" });
            }
        });
    } catch (err) {
        // console.log(err);
        // next(err);
        res.json({ success: false, message: "Error updating video metadata" });
    }
};


// Soft Delete selected video
exports.deleteVideoSoft = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Obtaining all the available credentials from the account
    const updateQueryVideo = `
        UPDATE YouTubeVideos_${decoded.username}
        SET is_deleted = ${req.body.is_deletion}
        WHERE username = '${decoded.username}'
            AND video_id = ANY($1::VARCHAR[])
    `;

    try {
        const deleteVideo = await pool.query(updateQueryVideo, [req.body.id]);
        res.json({ success: true, message: "Soft deleted!" });
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Soft deletion failed" });
    }
};


// HARD DELETE a selected video
// WARNING: THERES NO TURNING BACK!
exports.deleteVideoHard = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Obtain video credential ID
    const videoCredID = `
        SELECT google_account_id
        FROM YouTubeVideos_${decoded.username}
        WHERE username = $1 AND video_id = $2
    `;
    const videoIDQuery = await pool.query(videoCredID, [decoded.username, req.params.id]);
    const videoGoogleCredID = videoIDQuery.rows[0].google_account_id;

    // Obtaining all the available credentials from the account
    const selectQueryCredential = `
        SELECT id, email, data
        FROM GoogleCredential
        WHERE username = $1
    `;
    const queryCredential = await pool.query(selectQueryCredential, [decoded.username]);

    let credentialData;

    for (let currCred of queryCredential.rows) {
        if (videoGoogleCredID == currCred.id) {
            credentialData = currCred.data;
            break;
        }
    }

    // Obtain temporary access token
    const oauth2ClientAccessTokenGetter = setUpOAuth2ClientAccessToken(credentialData.yt_client_id, credentialData.yt_client_secret, credentialData.yt_redirect_uris);

    // Set the refresh token on the OAuth2Client
    oauth2ClientAccessTokenGetter.setCredentials({
        refresh_token: credentialData.yt_refresh_token,
    });

    const tempAccess = await refreshAccessToken(oauth2ClientAccessTokenGetter);
    const tempAccessToken = tempAccess.access_token;

    // Obtaining all the available credentials from the account
    const deleteQueryCredential = `
        DELETE FROM YouTubeVideos_${decoded.username}
        WHERE video_id = $1
            AND username = '${decoded.username}'`;
    const idToDelete = [req.params.id];

    try {
        // Set up OAuth2 client
        const oauth2Client = new OAuth2(
            credentialData.yt_client_secret,
            credentialData.yt_client_id,
            credentialData.yt_redirect_uris
        );

        oauth2Client.setCredentials({
            access_token: tempAccessToken
        });

        // Set up YouTube API client
        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        youtube.videos.delete({
            id: req.params.id
        }, async function (err, data) {
            if (err) {
                // console.log(err);
                res.json({ success: false, message: "Hard deletion failed!" });
            } else {
                const deleteVideo = await pool.query(deleteQueryCredential, [req.params.id]);
                res.json({ success: true, message: "Hard deleted!" });
            }
        });
    } catch (err) {
        next(err);
    }
};
