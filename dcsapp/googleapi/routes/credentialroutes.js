const express = require('express');
const router = express.Router();
const myCredentials = require('../apicaller/credentials');


module.exports = (pool) => {
    // Kick start to obtain the refresh token
    router.post('/credkickstart', (req, res) => {
        myCredentials.kickStartCredentials(req, res, pool);
    });

    // Upload new Google Credentials for user
    router.post('/credentials', (req, res) => {
        myCredentials.createCredentials(req, res, pool);
    });

    // Delete Google Credentials for user
    router.delete('/credentials/:id', (req, res) => {
        myCredentials.deleteCredentials(req, res, pool);
    });

    return router;
}
