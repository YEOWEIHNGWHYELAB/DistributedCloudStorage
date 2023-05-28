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
        console.log(error);
        res.json({ success: false, message: "Failed to change folder directory!" });
    }
}
