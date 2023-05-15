const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


function checkAuthHeader(authHeader, res) {
    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Authorization header missing" });
    }

    return (token = authHeader.split(" ")[1]);
}

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

function setUpOAuth2ClientAccessToken(client_id, client_secret, redirect_url) {
    // Initialize the OAuth2Client
    const oauth2Client = new OAuth2Client(
        client_id, // CLIENT_ID
        client_secret, // CLIENT_SECRET
        redirect_url // REDIRECT_URL
    );

    return oauth2Client;
}

// Wrap the refreshAccessToken function in a promise
function refreshAccessToken(oauth2ClientAccessTokenGetter) {
    return new Promise((resolve, reject) => {
        oauth2ClientAccessTokenGetter.refreshAccessToken((err, token) => {
            if (err) {
                // reject(err);
                res.json({ success: false, message: "Failed to get token!" });
            } else {
                resolve(token);
            }
        });
    });
}

function setUpOAuth2Client(clientSecret, clientID, redirectURI, accessToken) {
    const oauth2Client = new OAuth2(clientSecret, clientID, redirectURI);

    oauth2Client.setCredentials({
        access_token: accessToken,
    });

    return oauth2Client;
}

exports.getPublicChannelStat = async (req, res, pool) => {
    const authHeader = req.headers.authorization;
    const dcsAuthToken = checkAuthHeader(authHeader, res);

    // Decoding the JWT
    let decoded = decodeAuthToken(dcsAuthToken, res);

    // Obtaining all the available credentials from the account
    const selectQueryCredential = `
        SELECT id, email, data
        FROM GoogleCredential
        WHERE username = $1
    `;

    const queryCredential = await pool.query(selectQueryCredential, [
        decoded.username,
    ]);

    let results = [];

    for (let currCred of queryCredential.rows) {
        // Obtain temporary access token
        const oauth2ClientAccessTokenGetter = setUpOAuth2ClientAccessToken(
            currCred.data.yt_client_id,
            currCred.data.yt_client_secret,
            currCred.data.yt_redirect_uris
        );

        // Set the refresh token on the OAuth2Client
        oauth2ClientAccessTokenGetter.setCredentials({
            refresh_token: currCred.data.yt_refresh_token,
        });

        const tempAccess = await refreshAccessToken(
            oauth2ClientAccessTokenGetter
        );

        const oauth2Client = setUpOAuth2Client(
            currCred.data.yt_client_id,
            currCred.data.yt_client_secret,
            currCred.data.yt_redirect_uris,
            tempAccess.access_token
        );

        const youtube = google.youtube({
            version: "v3",
            auth: oauth2Client,
        });

        try {
            const response = await youtube.channels.list({
                part: "statistics",
                mine: true,
            });

            const channel = response.data.items[0];
            const publicChannelStat = channel;

            results.push(publicChannelStat);
        } catch (error) {
            res.json({ success: false, message: "Error retrieving channel info!"});
            // console.error("Error retrieving channel information:", error.message);
        }
    }

    // console.log(results);

    res.json({ success: true, message: "Successfully obtain channels info", results: results});
};
