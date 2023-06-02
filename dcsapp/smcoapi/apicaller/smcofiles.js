const jwt = require("jsonwebtoken");
const fileManager = require("./filemanager");
const folderManager = require("./pathmanager");
const Deque = require('collections/deque');


function decodeAuthToken(dcsAuthToken, res) {
    try {
        let decoded = jwt.verify(dcsAuthToken, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
        return decoded;
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

function pathArrayCheck(pathArray) {
    for (let i = 1; i < pathArray.length; i++) {
        let currPath = pathArray[i];

        if (currPath == "") {
            return false;
        }
    }

    return true;
}

async function createDirectoryIfNotExist(rootID, pathArray, username, pool) {
    const newDirQuery = `
        INSERT INTO FileSystemPaths (username, path_name, path_level, path_parent) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
    `;

    const checkIfDirExist = `
        SELECT id
        FROM FileSystemPaths
        WHERE username = $1 
            AND path_name = $2
            AND path_level = $3
            AND path_parent = $4
    `;

    let currParentID = rootID;

    for (let pathLevel = 1; pathLevel < pathArray.length; pathLevel++) {
        // Check if the path already
        const dirExist = await pool.query(checkIfDirExist, [
            username,
            pathArray[pathLevel],
            pathLevel,
            currParentID,
        ]);

        if (dirExist.rows.length == 0) {
            // Path does not exist, so create it
            const dirCreation = await pool.query(newDirQuery, [
                username,
                pathArray[pathLevel],
                pathLevel,
                currParentID,
            ]);

            currParentID = dirCreation.rows[0].id;
        } else {
            // Path already exist, keep traversing down the path tree
            currParentID = dirExist.rows[0].id;
        }
    }
}

exports.mkDir = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    const dirToCreate = req.body.new_dir;

    const getRootQuery = `
        SELECT id
        FROM FileSystemPaths
        WHERE username = $1
            AND path_level = 0
    `;

    try {
        const getRootID = await pool.query(getRootQuery, [decoded.username]);
        const rootID = getRootID.rows[0].id;

        const pathArray = dirToCreate.split("/");

        if (pathArrayCheck(pathArray)) {
            await createDirectoryIfNotExist(
                rootID,
                pathArray,
                decoded.username,
                pool
            );

            res.json({
                success: true,
                message: "Directory successfully created!",
            });
        } else {
            res.json({
                success: false,
                message: "Invalid path!",
            });
        }
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to make directory!" });
    }
};

exports.getFolders = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    try {
        // Get root directory ID
            const getRootID = `
            SELECT id
            FROM FileSystemPaths
            WHERE path_level = 0
                AND username = $1
        `;
        const rootIDResult = await pool.query(getRootID, [decoded.username]);

        const folderQueue = new Deque();
        folderQueue.push({ folderID: rootIDResult.rows[0].id, childDepth: 1 });

        let lvlOrderedDirBuild = [];

        const getChildDirQuery = `
            SELECT id, path_name, path_level
            FROM FileSystemPaths
            WHERE path_level = $1
                AND path_parent = $2
                AND username = $3
        `;

        // Using BFS to get all the path that are nested
        while (folderQueue.length !== 0) {
            let currTarget = folderQueue.shift();

            lvlOrderedDirBuild.push((await folderManager.getFullPath(pool, decoded.username, parseInt(currTarget.folderID))).toString());

            const affectedFolderResult = await pool.query(getChildDirQuery, [currTarget.childDepth, currTarget.folderID, decoded.username]);

            for (let currChildDir of affectedFolderResult.rows) {
                folderQueue.push({ folderID: currChildDir.id, childDepth: (currChildDir.path_level + 1) });
            }
        }

        res.json({
            message: "Successfully obtain directory builder!",
            lvlorderdir: lvlOrderedDirBuild
        });
    } catch(error) {
        // console.log(error);
        res.json({ message: "Failed to get directory builder"});
    }
}

exports.getAllFiles = async (req, res, pool) => {
    // Authentication decode
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    // Page controls
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    let videoPaginatedQuery = `
        SELECT *
        FROM (
            (SELECT CONCAT('gh', '_', CAST(id AS VARCHAR)) AS id, filename, path_dir, 'github' AS platform, created_at
            FROM GitHubFiles_${decoded.username} 
            WHERE is_deleted = ${req.body.is_deleted})
            UNION ALL
            (SELECT CONCAT('yt', '_', CAST(video_id AS VARCHAR)) AS id, title AS filename, path_dir, 'youtube' AS platform, created_at
            FROM YouTubeVideos_${decoded.username}
            WHERE is_deleted = ${req.body.is_deleted})
        ) AS compiled_files
    `;

    if (req.body.search && req.body.search.trim() !== "") {
        videoPaginatedQuery += `WHERE filename ILIKE '%${req.body.search.trim()}%' `;
    }

    if (req.body.is_paginated) {
        videoPaginatedQuery += `LIMIT $1 OFFSET $2`;
    }

    const ghPartitionTable = `GitHubFiles_${decoded.username}`;
    const ytPartitionTable = `YouTubeVideos_${decoded.username}`;

    const queryPageCount = `
        SELECT (
            (SELECT COUNT(*)
            FROM ${ghPartitionTable}
            WHERE is_deleted = ${req.body.is_deleted}) + 
            (SELECT COUNT(*)
            FROM ${ytPartitionTable}
            WHERE is_deleted = ${req.body.is_deleted})
        ) AS total_count
    `;

    let fileIDDIRhm = new Map();

    try {
        let filesPagResult 
        
        if (req.body.is_paginated) {
            filesPagResult = await pool.query(videoPaginatedQuery, [
                limit,
                offset,
            ]);
        } else {
            filesPagResult = await pool.query(videoPaginatedQuery, []);
        }

        for (let i = 0; i < filesPagResult.rows.length; i++) {
            let currPathID = parseInt(filesPagResult.rows[i].path_dir);

            if (!fileIDDIRhm.has(currPathID)) {
                filesPagResult.rows[i].full_pathname = (await folderManager.getFullPath(pool, decoded.username, parseInt(currPathID))).toString();
                fileIDDIRhm.set(currPathID, filesPagResult.rows[i].full_pathname);
            } else {
                filesPagResult.rows[i].full_pathname = fileIDDIRhm.get(currPathID);
            }
        }

        /*
        for (const [key, value] of fileIDDIRhm.entries()) {
            console.log("KEY: " + key + ' : VALUE: ' + value);
        }
        */

        const queryPageCountResult = await pool.query(queryPageCount, []);
        const totalFilesCount = queryPageCountResult.rows[0].total_count;

        res.json({
            success: true,
            message: "Files obtained successfully",
            results: filesPagResult.rows,
            maxpage: req.body.is_paginated ? Math.ceil(totalFilesCount / limit) : 0,
            filecount: parseInt(totalFilesCount),
        });
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to get files" });
    }
};

exports.changeFileDir = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    let pathArray;
    let pathTargetName;
    let pathDepth;

    if (req.body.new_path != "/") {
        pathArray = pathTarget.split("/");
        pathTargetName = pathArray[pathArray.length - 1];
        pathDepth = pathArray.length - 1;
    } else {
        pathTargetName = "";
        pathDepth = 0;
    }

    const queryIDPath = `
        SELECT id
        FROM FileSystemPaths
        WHERE path_name = '${pathTargetName}'
            AND username = '${decoded.username}'
            AND path_level = ${pathDepth}
    `;

    try {
        const idPathResult = await pool.query(queryIDPath, []);

        if (idPathResult.rows.length != 0) {
            const targetID = idPathResult.rows[0].id;

            await fileManager.changeFileDirectory(
                req.body.id,
                targetID,
                pool,
                res
            );
        } else {
            res.json({ success: false, message: "Directory does not exist!" });
        }
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failure to change directory!" });
    }
};

exports.changeFolderDir = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    const oldPathFolder = req.body.old_path;
    const oldPathArray = oldPathFolder.split("/");
    const oldFolderName = oldPathArray[oldPathArray.length - 1];
    const oldFolderDepth = oldPathArray.length - 1;

    const newTargetPath = req.body.new_path;
    let newPathArray; 
    let newFolderName; 
    let newFolderDepth;

    if (newTargetPath != "/") {
        newPathArray = newTargetPath.split("/");
        newFolderName = newPathArray[newPathArray.length - 1];
        newFolderDepth = newPathArray.length - 1;
    } else {
        newFolderName = "";
        newFolderDepth = 0;
    }
    
    const queryIDOldPath = `
        SELECT id, path_level
        FROM FileSystemPaths
        WHERE path_name = $1
            AND username = $2
            AND path_level = $3
    `;

    try {
        const idOldPathResult = await pool.query(queryIDOldPath, [
            oldFolderName,
            decoded.username,
            oldFolderDepth,
        ]);
        const idNewPathResult = await pool.query(queryIDOldPath, [
            newFolderName,
            decoded.username,
            newFolderDepth,
        ]);

        if (
            idOldPathResult.rows.length != 0 &&
            idNewPathResult.rows.length != 0
        ) {
            const oldPathID = idOldPathResult.rows[0].id;
            const newPathID = idNewPathResult.rows[0].id;
            const newPathLevel = idNewPathResult.rows[0].path_level + 1;

            const resultChangeFolder =
                await folderManager.changeFolderDirectory(
                    pool,
                    oldPathID,
                    newPathID,
                    newPathLevel,
                    decoded.username,
                    res
                );
        } else {
            res.json({ success: false, message: "Path does not exist!" });
        }
    } catch (error) {
        // console.log(error);
        res.json({
            success: false,
            message: "Failed to change folder directory",
        });
    }
};

exports.renameFolderDir = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    const pathToRename = req.body.path_rename;
    const pathToRenameArray = pathToRename.split("/");
    const oldFolderName = pathToRenameArray[pathToRenameArray.length - 1];
    const pathDepthRename = pathToRenameArray.length - 1;

    const newPathname = req.body.new_pathname;

    try {
        await folderManager.renameFolder(
            res,
            pool,
            oldFolderName,
            pathDepthRename,
            decoded.username,
            newPathname
        );
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Failed to rename folder!",
        });
    }
};

exports.deleteDir = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    let decoded = decodeAuthToken(token, res);

    const pathToDelete = req.body.directory_name;
    const pathToDeleteArray = pathToDelete.split("/");

    if (!pathArrayCheck(pathToDeleteArray)) {
        return res.status(401).json({ message: "Invalid directory!" });
    }

    const pathName = pathToDeleteArray[pathToDeleteArray.length - 1];
    const pathDepth = pathToDeleteArray.length - 1;

    const folderTargetIDquery = `
        SELECT id
        FROM FileSystemPaths
        WHERE path_level = $1
            AND path_name = $2
            AND username = $3
    `;

    try {
        const folderTargetIDResult = await pool.query(folderTargetIDquery, [
            pathDepth,
            pathName,
            decoded.username,
        ]);

        /**
         * 1) We need to ensure that the deletion is not on root directory
         * 2) Obtain all the files in that directory including nested directories,
         *  then set all those files' path to be at the root directory
         * 3) Delete that directory along with its nested directories
         * 4) Lastly delete this folder itself
         *
         * Do note that items deleted from a folder will be transfer to recycle
         * bin, but then if that folder gets deleted, then that item needs to be
         * thrown to root directory.
         *
         * To recursively get all files in a directory, we will perform a breadth
         * first search to get all the files and folder inside.
         */
        if (folderTargetIDResult.rows.length > 0) {
            const folderTargetID = folderTargetIDResult.rows[0].id;

            await folderManager.bfsFolderFileChildCascade(res, pool, folderTargetID, pathDepth + 1, decoded.username);
        } else {
            res.json({ message: "Folder does not exist!" });
        }
    } catch (error) {
        // console.log(error);
        res.json({ message: "Failed to delete folder!" });
    }
};
