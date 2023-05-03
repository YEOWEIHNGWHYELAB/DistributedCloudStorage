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

        if (response.nextPageToken) {
            nextPageToken = response.nextPageToken;
        } else {
            break;
        }
    }

    res.json(videos);
}

exports.getChannelVideos = getChannelVideos;
