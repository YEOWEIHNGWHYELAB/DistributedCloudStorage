function videosArrayDataPopulator(videos, response) {
    videos.push(...response.items.map(item => {
        const video = {
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
        };

        if (item.snippet.thumbnails && item.snippet.thumbnails.default) {
            video.thumbnailUrl = item.snippet.thumbnails.default.url;
        }

        return video;
    }));
}

async function getPlaylistItems(youtube, playlistId, nextPageToken, maxVideoPerPage) {
    const response = await youtube.playlistItems.list({
        part: 'snippet',
        maxResults: maxVideoPerPage,
        playlistId: playlistId,
        pageToken: nextPageToken
    });

    return response.data;
}

async function getChannelVideoByToken(res, youtube, playlistId, maxVideoPerPage, pageToken) {
    let videos = [];

    const response = await getPlaylistItems(youtube, playlistId, pageToken, maxVideoPerPage);

    videosArrayDataPopulator(videos, response);

    const data = {
        video: videos,
        pageToken: response.nextPageToken
    };

    res.json(data);
}

async function getChannelAllVideos(res, youtube, playlistId, maxVideoPerPage) {
    let videos = [];

    let nextPageToken = null;

    while (true) {
        const response = await getPlaylistItems(youtube, playlistId, nextPageToken, maxVideoPerPage);

        videosArrayDataPopulator(videos, response);

        if (response.nextPageToken) {
            nextPageToken = response.nextPageToken;
        } else {
            break;
        }
    }

    res.json(videos);
}

exports.listVideoPaginated = async (req, res) => {
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
        console.log(err);
    }
}