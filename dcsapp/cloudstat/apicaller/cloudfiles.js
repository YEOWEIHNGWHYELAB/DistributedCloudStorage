const jwt = require("jsonwebtoken");


function checkAuthHeader(authHeader, res) {
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    return token = authHeader.split(" ")[1];
}

async function getNumYTVideos(decoded, pool, isDeleted) {
    const selectYTVideos = `
        SELECT COUNT(*)
        FROM youtubevideos_${decoded.username}
        WHERE is_deleted = ${isDeleted}
    `;
    const queryYTVideos = await pool.query(selectYTVideos, []);

    return queryYTVideos.rows[0].count;
}

async function getNumGHVideos(decoded, pool, isDeleted) {
    const selectGHFiles = `
        SELECT COUNT(*)
        FROM githubfiles_${decoded.username}
        WHERE is_deleted = ${isDeleted}
    `;
    const queryGHFiles = await pool.query(selectGHFiles, []);

    return queryGHFiles.rows[0].count;
}

exports.getFileStat = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    let decoded;

    try {
        decoded = jwt.verify(dcsAuthToken, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        const numYTVideo = await getNumYTVideos(decoded, pool, false);
        const numYTVideoDeleted = await getNumYTVideos(decoded, pool, true);

        const numGHFiles = await getNumGHVideos(decoded, pool, false);
        const numGHFilesDeleted = await getNumGHVideos(decoded, pool, true);

        res.json({
            numytvideo: numYTVideo,
            numytvideo_deleted: numYTVideoDeleted,
            numghfiles: numGHFiles,
            numGHFilesDeleted: numGHFilesDeleted
        });
    } catch(error) {
        res.status(401).json({ message: "Error retrieving cloud file stat!"})
    }
};
