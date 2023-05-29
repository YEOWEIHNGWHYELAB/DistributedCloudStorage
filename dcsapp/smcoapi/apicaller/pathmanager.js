const Deque = require('collections/deque');


async function deleteChildFiles(pool, idArray, platform, fileIDName, rootID, username, typeID) {
    const deleteGHFilesInFolder = `
        UPDATE ${platform}
        SET is_deleted = true, path_dir = ${rootID}
        WHERE ${fileIDName} = ANY($1::${typeID}[])
            AND username = '${username}'
    `;

    try {
        await pool.query(deleteGHFilesInFolder, [idArray]);
    } catch (error) {
        console.log(error);
    }
}

async function deleteFolders(pool, idArray, username) {
    const deleteFolderQuery = `
        DELETE
        FROM FileSystemPaths 
        WHERE id = ANY($1::BIGINT[])
            AND username = '${username}'
    `;

    try {
        await pool.query(deleteFolderQuery, [idArray]);
    } catch (error) {
        console.log(error);
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

    const folderQueue = new Deque();

    folderQueue.push({ folderID: folderTargetID, childDepth: pathDepth });

    // For each of this chil, you will need to delete all the 
    // files within them also
    const getChildDirQuery = `
        SELECT id, path_level
        FROM FileSystemPaths
        WHERE path_level = $1
            AND path_parent = $2
            AND username = $3
    `;

    // Using BFS to get all the path that are nested
    while (folderQueue.length !== 0) {
        let currTarget = folderQueue.shift();

        folderAffectedID.push(parseInt(currTarget.folderID));

        const affectedFolderResult = await pool.query(getChildDirQuery, [currTarget.childDepth, currTarget.folderID, username]);

        for (let currChildDir of affectedFolderResult.rows) {
            folderQueue.push({ folderID: currChildDir.id, childDepth: (currChildDir.path_level + 1) });
        }
    }

    // Get root directory ID
    const getRootID = `
        SELECT id
        FROM FileSystemPaths
        WHERE path_level = 0
            AND username = $1
    `;
    const rootIDResult = await pool.query(getRootID, [username]);

    try {
        // Delete files first
        await deleteChildFiles(pool, folderAffectedID, "GitHubFiles", "id", rootIDResult.rows[0].id, username, "BIGINT");
        await deleteChildFiles(pool, folderAffectedID, "YouTubeVideos", "video_id", rootIDResult.rows[0].id, username, "VARCHAR");

        // Delete the folders
        await deleteFolders(pool, folderAffectedID, username);

        res.json({ message: "Folder deleted" });
    } catch(error) {
        res.json({ message: "Failed to delete files in folder" });
    }
}
