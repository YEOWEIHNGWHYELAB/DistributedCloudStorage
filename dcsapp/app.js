const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const auth = require('./auth/apicaller/auth');
var OAuth2 = google.auth.OAuth2;

// ENV Config
const dotenv = require("dotenv");
dotenv.config();

// Initialize the Express app
const app = express();

// Use middlewares
app.use(bodyParser.json());
app.use(cors());

// Set up the database connection pool
const pool = new Pool({
    user: process.env.DBUSERNAME,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT,
});

// Initialize PG DB
const sqlScriptPath = path.join(__dirname, "./dbmanager/initializedb/initpgdb.sql");
const sqlScript = fs.readFileSync(sqlScriptPath, "utf-8");
const pgDBInitializer = require('./dbmanager/initializedb/initpgdb');
pgDBInitializer.initpgdb(pool, sqlScript);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database at', res.rows[0].now);
    }
});

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
const youtubeVideosRoute = require('./googleapi/routes/ytvideoroutes')(pool);
app.use('/google', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, youtubeVideosRoute);

// Youtube Direct Routers
const youtubeDirectRoute = require('./googleapi/routes/ytdirectroutes')(pool);
app.use('/google', (req, res, next) => {
    auth.isAuthenticated(req, res, next, pool);
}, youtubeDirectRoute);

// Start the server
const PORT = process.env.WEBPORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
