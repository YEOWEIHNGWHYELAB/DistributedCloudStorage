const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const auth = require('./auth/apicaller/auth');


// ENV Config
const dotenv = require("dotenv");
dotenv.config();

// Initialize the Express app
const express = require('express');
const app = express();

// Use middlewares
app.use(bodyParser.json());
app.use(cors());


// Initialize PG DB
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.PGDBUSERNAME,
    host: process.env.PGDBHOST,
    database: process.env.PGDBNAME,
    password: process.env.PGDBPASSWORD,
    port: process.env.PGDBPORT,
});
const sqlScriptPath = path.join(__dirname, "./dbmanager/initializedb/initpgdb.sql");
const sqlScript = fs.readFileSync(sqlScriptPath, "utf-8");
const pgDBInitializer = require('./dbmanager/initializedb/initpgdb');


// Initialize MongoDB
const uriMongoDB = process.env.MONGODBURI;
const mongoDBInitializer = require('./dbmanager/initializedb/initmongodb');


// Call the initialization for each database when the server starts
Promise.all([
    pgDBInitializer.initpgdb(pool, sqlScript, process.env.PGDBNAME),
    pgDBInitializer.testPGConnection(pool),
    mongoDBInitializer.mongoDBConnector(uriMongoDB)
]).then((results) => {
    // Obtaining the collections from mongoDB
    const { 
        mongoYTTrackCollection, 
        mongoYTMetaCollection 
    } = results[2];

    /**
     * Authentication for DCS
     */
    // Authentication Routing
    const authRouter = require('./auth/routes/authroutes')(pool);
    app.use('/auth', authRouter);


    /**
     * GitHub DCS
     */
    // GitHub Credential Routers
    const githubCredentialsRouter = require('./githubapi/routes/credentialroutes')(pool);
    app.use('/github', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, githubCredentialsRouter);

    // GitHub Files Routers
    const githubMyFilesRouter = require('./githubapi/routes/myfilesroutes')(pool);
    app.use('/github', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, githubMyFilesRouter);

    // GitHub Account Stat
    const githubAccountStatRouter = require('./githubapi/routes/accountstatroutes')(pool);
    app.use('/github', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, githubAccountStatRouter);


    /**
     * Google Drive & YouTube DCS
     */
    // Google Credentials Route
    const googleCredentialsRoute = require('./googleapi/routes/credentialroutes')(pool);
    app.use('/google', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, googleCredentialsRoute);

    // Youtube Videos Routers
    const youtubeVideosRoute = require('./googleapi/routes/ytvideoroutes')(pool, mongoYTTrackCollection);
    app.use('/google', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, youtubeVideosRoute);

    // Youtube Direct Routers
    const youtubeDirectRoute = require('./googleapi/routes/ytdirectroutes')(pool);
    app.use('/google', (req, res, next) => {
        auth.isAuthenticated(req, res, next, pool);
    }, youtubeDirectRoute);


    // Start the server
    const PORT = process.env.WEBPORT || 3600;
    app.listen(PORT, () => {
        console.log(`Server started listening on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to initialize databases:', error);
});
