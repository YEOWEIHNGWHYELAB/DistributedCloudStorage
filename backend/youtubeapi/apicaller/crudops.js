async function getPlaylistItems(youtube, playlistId, videos, nextPageToken) {
    const response = await youtube.playlistItems.list({
        part: 'snippet',
        maxResults: 50,
        playlistId: playlistId,
        pageToken: nextPageToken
    });

    return response.data;
}

async function getChannelVideos(res, youtube, playlistId) {
    let videos = [];

    let nextPageToken = null;

    while (true) {
        const response = await getPlaylistItems(youtube, playlistId, nextPageToken);

        videos.push(...response.items.map(item => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId,
            thumbnailUrl: item.snippet.thumbnails.default.url
        })));

        if (response.nextPageToken) {
            nextPageToken = response.nextPageToken;
        } else {
            break;
        }
    }

    res.json(videos);
}

exports.getChannelVideos = getChannelVideos;
