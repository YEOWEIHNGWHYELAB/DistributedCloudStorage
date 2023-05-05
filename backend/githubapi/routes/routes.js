const express = require('express');
const router = express.Router();
const credentialController = require('../apicaller/credential');

module.exports = (pool) => {
    // Get all user's available GitHub Credentials
    router.get('/credentials', (req, res) => {
        credentialController.getCredentials(req, res, pool);
    });

    // Edit user's GitHub Credentials
    router.patch('/credentials', (req, res) => {
        credentialController.editCredetials(req, res, pool);
    });

    // Delete user's GitHub Credentials
    router.delete('/credentials', (req, res) => {
        credentialController.deleteCredetials(req, res, pool);
    });

    return router;
};
