const express = require('express');
const router = express.Router();
const myCredentials = require('../apicaller/credentials');

module.exports = (pool) => {
    // Upload new YouTube Credentials for user
    router.post('/credentials', (req, res) => {
        myCredentials.createCredentials(req, res, pool);
    });

    return router;
}
