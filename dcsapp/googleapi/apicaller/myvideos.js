const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// Upload new video
exports.uploadVideo = async (req, res, pool) => {
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
};

// Edit video meta data
exports.editVideoMeta = async (req, res, pool) => {
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



// HARD DELETE a selected video
// WARNING: THERES NO TURNING BACK!
exports.deleteVideo = async (req, res, pool) => {
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
