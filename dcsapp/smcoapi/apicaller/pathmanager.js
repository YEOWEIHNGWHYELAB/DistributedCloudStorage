const Deque = require('collections/deque');


async function deleteChildFiles(pool, idArray, platform) {
    const deleteGHFilesInFolder = `
        UPDATE ${platform}
        SET is_deleted = true
        WHERE ANY($1::BIGINT[]);
    `;

    try {
        await pool.query(deleteGHFilesInFolder, [idArray]);
    } catch (error) {
        // console.log(error);
    }
}

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

exports.bfsFolderFileChildCascade = async(res, pool, folderTargetID, pathDepth, username) => {
    let folderAffectedID = [];

    let ghFileID = [];
    let ytFileID = [];

    const folderQueue = new Deque();

    folderQueue.push(folderTargetID);

    // For each of this chil, you will need to delete all the 
    // files within them also
    const getChildDirQuery = `
        SELECT id
        FROM FileSystemPaths
        WHERE path_level = $1
            AND path_parent = $2
            AND username = $3
    `;

    for (let i = pathDepth; folderQueue.length === 0; i++) {
        const affectedFolderResult = pool.query(getChildDirQuery, [i, folderTargetID, username]);

        console.log(affectedFolderResult.rows);

        folderAffectedID.push(folderQueue.shift());
    }
    
}
