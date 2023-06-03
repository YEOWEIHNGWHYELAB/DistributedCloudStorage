const Deque = require('collections/deque');


async function deleteChildFiles(pool, idArray, platform, rootID, username) {
    const deleteGHFilesInFolder = `
        UPDATE ${platform}
        SET is_deleted = true, path_dir = ${rootID}
        WHERE path_dir = ANY($1::BIGINT[])
            AND username = '${username}'
    `;

    try {
        await pool.query(deleteGHFilesInFolder, [idArray]);
    } catch (error) {
        // console.log(error);
    }
}

async function deleteFolders(pool, folderTargetID, username) {
    const deleteFolderQuery = `
        DELETE
        FROM FileSystemPaths 
        WHERE id = $1
            AND username = '${username}'
    `;

    try {
        await pool.query(deleteFolderQuery, [folderTargetID]);
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

exports.getFullPath = async (pool, username, pathID) => {
    const getPathFullQuery = `
        SELECT path_parent, path_name, path_level
        FROM FileSystemPaths
        WHERE username = $1
            AND id = $2
    `;

    let startID = pathID;
    let pathsb = "";
    let curr_path_level = Number.MAX_SAFE_INTEGER;

    while (curr_path_level > 1) {
        const changeFolderResult = await pool.query(getPathFullQuery, [username, startID]);

        curr_path_level = changeFolderResult.rows[0].path_level;

        pathsb = "/" + changeFolderResult.rows[0].path_name + pathsb;
        startID = changeFolderResult.rows[0].path_parent;
    }

    return pathsb;
}

exports.bfsFolderFileChildCascade = async (res, pool, folderTargetID, pathDepth, username) => {
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
        await deleteChildFiles(pool, folderAffectedID, "GitHubFiles", rootIDResult.rows[0].id, username);
        await deleteChildFiles(pool, folderAffectedID, "YouTubeVideos", rootIDResult.rows[0].id, username);

        // Delete the folders
        await deleteFolders(pool, folderTargetID, username);

        res.json({ message: "Folder deleted" });
    } catch(error) {
        res.json({ message: "Failed to delete files in folder" });
    }
}

exports.setAllFileFolderDir = async (res, pool, oldFolderID, folderTargetID, username, pathLevelTarget) => {
    const setFileToNewFolderQueryGH = `
        UPDATE GitHubFiles_${username}
        SET path_dir = $1
        WHERE path_dir = $2
    `;

    const setFileToNewFolderQueryYT = `
        UPDATE YouTubeVideos_${username}
        SET path_dir = $1
        WHERE path_dir = $2
    `;

    const setFolderToNewFolderQuery = `
        UPDATE FileSystemPaths
        SET path_parent = $1, path_level = $4
        WHERE path_parent = $2
            AND username = $3
    `;

    const deleteFolderQuery = `
        DELETE 
        FROM FileSystemPaths 
        WHERE id = $1; 
    `;

    try {
        await pool.query(setFolderToNewFolderQuery, [folderTargetID, oldFolderID, username, pathLevelTarget]);

        await pool.query(setFileToNewFolderQueryYT, [folderTargetID, oldFolderID]);

        await pool.query(setFileToNewFolderQueryGH, [folderTargetID, oldFolderID]);

        await pool.query(deleteFolderQuery, [oldFolderID]);

        res.json({
            message: "Successfully merged folder!"
        });
    } catch(err) {
        // console.log(err);
        res.json({ message: "Failed to merge folder!" });
    }
}
