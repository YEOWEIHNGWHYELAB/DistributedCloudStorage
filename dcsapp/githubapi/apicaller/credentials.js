const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const initializerTable = require("./initializer");


exports.createCredentials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    const createQuery = `
        INSERT INTO GitHubCredential
        (username, github_username, email, access_token)
        VALUES ($1, $2, $3, $4)
    `;

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }

    const createParam = req.body;

    try {
        const queryResult = await pool.query(createQuery, [
            decoded.username,
            createParam.github_username,
            createParam.email,
            createParam.access_token,
        ]);

        // All github account will have incremental repo naming and it starts with dcs_1
        const newRepoName = "dcs_1";

        const intializingResult = await initializerTable.initializeNewCredentialRepo(createParam.access_token, newRepoName);
        const credIDResult = await initializerTable.initializeNewCredentialRepoDCS(pool, decoded.username, newRepoName, createParam.github_username);
        const intializingFileIDForUpload = await initializerTable.initializeNewCredentialForFileIDUsage(pool, decoded.username, newRepoName, credIDResult);
        const initializeNewStorageTrack = await initializerTable.initalizeNewStorageTrack(pool, credIDResult);

        res.json({
            success: true,
            message: `Created ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

exports.getCredentials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });
    
        const queryResult = await pool.query(
            "SELECT id, github_username, email, access_token FROM GitHubCredential WHERE username = $1",
            [decoded.username]
        );
        
        res.json(queryResult.rows);
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid token" });
    }
};

exports.editCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    let editCredentialsQueryBuiler = [];
    let setClauses = [];

    const updateParams = req.body;

    editCredentialsQueryBuiler.push(`UPDATE GitHubCredential SET`);

    for (const key in updateParams) {
        if (key == "id") {
            continue;
        }

        const value = updateParams[key];

        if (value != null) {
            setClauses.push(`${key} = '${value}'`);
        }
    }

    editCredentialsQueryBuiler.push(setClauses.join(", "));

    editCredentialsQueryBuiler.push(`WHERE id = ${updateParams.id}`);

    const editCredentialsQuery = editCredentialsQueryBuiler.join(" ");

    try {
        const queryResult = await pool.query(editCredentialsQuery);
        res.json({
            success: true,
            message: `Updated ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

exports.deleteCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const sqlQuery = `DELETE FROM GitHubCredential WHERE id = $1`;
    const idToDelete = [req.params.id];

    try {
        const queryResult = await pool.query(sqlQuery, idToDelete);
        res.json({
            success: true,
            message: `Deleted ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

exports.deleteMultipleCredetials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    const sqlQuery = `DELETE FROM GitHubCredential WHERE id = ANY($1::int[])`;

    const idsToDelete = [req.body.id];

    try {
        const queryResult = await pool.query(sqlQuery, idsToDelete);
        res.json({
            success: true,
            message: `Deleted ${queryResult.rowCount} rows`,
        });
    } catch (err) {
        // console.error(err);
        res.status(403).json({ success: false, message: "Failed to delete!" });
    }
};
