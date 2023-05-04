const express = require('express');
const router = express.Router();
const credentialController = require('../apicaller/credential');

module.exports = (pool) => {
    // Register user
    router.get('/list', (req, res) => {
        credentialController.getCredentials(req, res, pool);
    });

    return router;
};
