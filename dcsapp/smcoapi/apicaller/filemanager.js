exports.changeFileDirectory = async (idArray, targetPathID, pool, res) => {
    let ghFilesID = [];
    let ytVideoID = [];

    for (currFileID of idArray) {
        let firstUnderscoreIndex = currFileID.indexOf("_");
        let platform = currFileID.slice(0, firstUnderscoreIndex);
        let fileID = currFileID.slice(firstUnderscoreIndex + 1);

        if (platform == "yt") {
            ytVideoID.push(fileID);
        } else if (platform == "gh") {
            ghFilesID.push(parseInt(fileID));
        }
    }

    const updateYTVideoPath = `
        UPDATE YouTubeVideos
        SET path_dir = $2
        WHERE video_id = ANY($1::VARCHAR[])
    `;

    const updateGHFiles = `
        UPDATE GitHubFiles
        SET path_dir = $2
        WHERE id = ANY($1::BIGINT[])
    `;

    try {
        const updateYTRes = await pool.query(updateYTVideoPath, [ytVideoID, targetPathID]);
        const updateGHRes = await pool.query(updateGHFiles, [ghFilesID, targetPathID]);

        res.json({ success: true, message: "Successfully change directory!" });
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to change directory!" });
    }
}

exports.changeFileName = async (res, pool, username, id, new_filename) => {
    let firstUnderscoreIndex = id.indexOf("_");
    let platform = id.slice(0, firstUnderscoreIndex);
    let fileID = id.slice(firstUnderscoreIndex + 1);

    try {
        if (platform == "yt") {
            const updateQueryYTVideo = `
                UPDATE YouTubeVideos_${username}
                SET title = $2
                WHERE video_id = $1
            `;

            await pool.query(updateQueryYTVideo, [fileID, new_filename]);
        } else if (platform == "gh") {
            const tablePartitionName = `GitHubFiles_${username}`;

            const updateQueryGHfile = 
                `UPDATE ${tablePartitionName}
                SET filename = $2
                WHERE id = $1`;

            await pool.query(updateQueryGHfile, [fileID, new_filename]);
        }

        res.json({ message: "File renamed!" });
    } catch(error) {
        res.json({ message: "Failed to rename!" });
    }
}
