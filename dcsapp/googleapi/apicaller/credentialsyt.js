const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');


/**
* Obtain the client_id, client_secret, redirect_uri first, then perform the 
* kick on the redirect to obtain the refresh token
* 
* 1) Fill in the 3 fields stated first, then perform a POST to redurect back 
* to the same page with the code in the URL params
* 2) Then now perform the actual adding of all the fields including refresh
* token
*/

function getDecodedJWTInfo(authHeader, res) {
    try {
        let decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        return decoded;
    } catch (err) {
        // console.error(err);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}

function getAuthURLWithYTScope(oauth2Client) {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube',
    });
}

function getOauth2Client(req) {
    return new OAuth2Client(
        req.body.yt_client_id,
        req.body.yt_client_secret,
        req.body.yt_redirect_uri);
}

// Kick start to obtain the kick start access token
exports.kickStartCredentialsYT = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    const credentials = req.body;

    // Perform the obtaining of the kick start access token
    const oauth2Client = getOauth2Client(req);
    const authUrl = getAuthURLWithYTScope(oauth2Client);

    res.json(
        {
            success: true,
            message: "Please go to the following link!",
            auth_url: authUrl
        }
    );
};

// Add new credentials
exports.createCredentialsYT = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    const urlAccessTokenCode = req.body.yt_access_token_kickstart;

    // Initialize the OAuth2Client
    const oauth2Client = getOauth2Client(req);

    try {
        // Exchange the authorization code for tokens
        const { tokens } = await oauth2Client.getToken(urlAccessTokenCode);

        // Extract the refresh token from the response
        const refreshToken = tokens.refresh_token;

        const credentialData = 
        {
            yt_client_id: req.body.yt_client_id,
            yt_client_secret: req.body.yt_client_secret,
            yt_redirect_uris: req.body.yt_redirect_uri,
            yt_refresh_token: refreshToken
        };
        const credentialJSONB = JSON.stringify(credentialData);

        // Store the refresh token securely in your application's backend or database

        // Set the access token and refresh token for the OAuth2 client
        oauth2Client.setCredentials({
            access_token: tokens.access_token,
            refresh_token: refreshToken,
        });
        
        const selectQueryCredential = `
            SELECT * 
            FROM GoogleCredential
            WHERE email = $1
        `;
        const emailValues = [req.body.email];
        const queryCredential = await pool.query(selectQueryCredential, emailValues);

        if (queryCredential.rows[0] != null) {
            const updateQueryText = `
                UPDATE GoogleCredential
                SET data = $2
                WHERE email = $1`
            ;
            const updateValues = [req.body.email, credentialJSONB];
            const resultUpdate = await pool.query(updateQueryText, updateValues);
        } else {
            const insertQueryText = `
                INSERT INTO 
                    GoogleCredential (username, email, data) 
                    VALUES ($1, $2, $3)`;
            const insertValues = [decoded.username, req.body.email, credentialJSONB];
            const resultInsertion = await pool.query(insertQueryText, insertValues);
        }

        // Continue with your application logic
        res.json(
            {
                success: true, 
                message: "Authorization successful!"
            }
        );
    } catch (error) {
        // console.error('Failed to exchange authorization code for tokens:', error);
        res.json(
            {
                success: false, 
                message: "Failed to authorize!"
            }
        );
    }
};

exports.updateCredentialsYT = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    try {
        const updateQueryText = `
            UPDATE GoogleCredential
            SET email = $2
            WHERE id = $1
                AND username = '${decoded.username}'`;

        const updateID = req.body.id;
        const email = req.body.email;
        const values = [updateID, email];
        const updateQueryCredential = await pool.query(updateQueryText, values);

        res.json(
            {
                success: true, 
                message: "Successfully updated selected credential!"
            }
        );
    } catch(error) {
        console.error('Failed to exchange authorization code for tokens:', error);
        res.json(
            {
                success: false, 
                message: "Failed to update credential!"
            }
        );
    }
};

exports.getCredentials = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    try {
        const selectQueryText = `SELECT id, email, data FROM GoogleCredential WHERE username = $1`;
        const usernameValue = [decoded.username];
        const selectQueryCredential = await pool.query(selectQueryText, usernameValue);

        res.json(
            {
                success: true, 
                results: selectQueryCredential.rows
            }
        );
    } catch (error) {
        // console.error('Failed to exchange authorization code for tokens:', error);
        res.json(
            {
                success: false, 
                message: "Failed to delete credential!"
            }
        );
    }
};

exports.deleteCredentialsYTMulDel = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    try {
        const deleteQueryText = `
            DELETE FROM GoogleCredential 
            WHERE id = ANY($1::int[]) 
                AND username = '${decoded.username}'`;
        const deleteValues = [req.body.id];
        const deleteQueryCredential = await pool.query(deleteQueryText, deleteValues);

        res.json(
            {
                success: true, 
                message: "Successfully deleted selected credential!"
            }
        );
    } catch (error) {
        console.error('Failed to exchange authorization code for tokens:', error);
        res.json(
            {
                success: false, 
                message: "Failed to delete credential!"
            }
        );
    }
};

exports.deleteCredentialsYT = async (req, res, pool) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    let decoded = getDecodedJWTInfo(authHeader, res);

    try {
        const deleteQueryText = `
            DELETE FROM GoogleCredential 
            WHERE id = $1 
                AND username = '${decoded.username}'`;
        const deleteValue = [req.params.id];
        const deleteQueryCredential = await pool.query(deleteQueryText, deleteValue);

        res.json(
            {
                success: true, 
                message: "Successfully deleted credential!"
            }
        );
    } catch (error) {
        // console.error('Failed to exchange authorization code for tokens:', error);
        res.json(
            {
                success: false, 
                message: "Failed to delete credential!"
            }
        );
    }
};
