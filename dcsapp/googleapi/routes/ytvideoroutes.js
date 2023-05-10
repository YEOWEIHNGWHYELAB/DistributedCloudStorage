const express = require('express');
const router = express.Router();
const myVideosController = require('../apicaller/myvideos');

module.exports = (pool) => {
    // Upload new YouTube Credentials for user
    router.post('/credentials', (req, res) => {
        credentialController.createCredentials(req, res, pool);
    });

    return router;
};