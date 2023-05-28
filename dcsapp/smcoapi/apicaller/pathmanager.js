exports.changeFolderDirectory = async (pool, oldPathID, newPathID, newPathLevel, username, res) => {
    const changeFolderQuery = `
        UPDATE FileSystemPaths
        SET path_parent = $1, path_level = $2
        WHERE username = $3
            AND id = $4
    `;

    try {
        const changeFolderResult = await pool.query(changeFolderQuery, [newPathID, newPathLevel, username, oldPathID]);

        res.json({ success: true, message: "Folder directory changed successfully!"});
    } catch(error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to change folder directory!" });
    }
}

exports.renameFolder = async (res, pool, oldFolderName, pathDepthRename, username, newPathname) => {
    const renameFolderQuery = `
        UPDATE FileSystemPaths
        SET path_name = $1
        WHERE username = $2
            AND path_level = $3
            AND path_name = $4
    `;

    try {
        const changeFolderResult = await pool.query(renameFolderQuery, [newPathname, username, pathDepthRename, oldFolderName]);

        res.json({ success: true, message: "Folder renamed successfully!"});
    } catch(error) {
        res.json({ success: false, message: "Failed to rename folder!" });
    }
}
