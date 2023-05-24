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
        (SELECT CAST(id AS VARCHAR) AS id, filename, 'github' AS platform, created_at
        FROM GitHubFiles_${decoded.username} 
        WHERE is_deleted = ${req.body.is_deleted})
        UNION ALL
        (SELECT video_id AS id, title AS filename, 'youtube' AS platform, created_at
        FROM YouTubeVideos_${decoded.username}
        WHERE is_deleted = ${req.body.is_deleted})
    `;

    // if (req.body.search && req.body.search.trim() !== "") {
    //     videoPaginatedQuery += `WHERE cloudtitle ILIKE '%${req.body.search.trim()}%' `;
    // }

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
        console.log(error);
        res.json({ success: false, message: "Failed to get files" });
    }
};
