const jwt = require("jsonwebtoken");

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
            AND LOWER(path_name) = LOWER($2)
            AND path_level = $3
            AND path_parent = $4
    `;

    let currParentID = rootID;

    for (let pathLevel = 1; pathLevel < pathArray.length; pathLevel++) {
        const dirExist = await pool.query(checkIfDirExist, 
            [username, pathArray[pathLevel], pathLevel, currParentID]);

        if (dirExist.rows.length == 0) {
            const dirCreation = await pool.query(newDirQuery, 
                [username, pathArray[pathLevel], pathLevel, currParentID]);
    
            currParentID = dirCreation.rows[0].id;
        } else {
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

        await createDirectoryIfNotExist(rootID, dirToCreate.split("/"), decoded.username, pool);

        /*
        res.json({
            success: true,
            message: "Directory successfully created!"
        });*/
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to make directory!" });
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

    videoPaginatedQuery += `LIMIT $1 OFFSET $2`;

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

    try {
        const filesPagResult = await pool.query(videoPaginatedQuery, [limit, offset]);

        const queryPageCountResult = await pool.query(queryPageCount, []);
        const totalFilesCount = queryPageCountResult.rows[0].total_count;

        res.json({
            success: true,
            message: "Files obtained successfully",
            results: filesPagResult.rows,
            maxpage: Math.ceil(totalFilesCount / limit),
            filecount: parseInt(totalFilesCount)
        });
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: "Failed to get files" });
    }
};
