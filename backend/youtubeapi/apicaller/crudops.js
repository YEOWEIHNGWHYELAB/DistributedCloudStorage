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

exports.getChannelAllVideos = getChannelAllVideos;
exports.getChannelVideoByToken = getChannelVideoByToken;
