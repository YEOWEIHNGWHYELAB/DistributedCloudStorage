const express = require('express');
const router = express.Router();
const credentialController = require('../apicaller/credentials');

module.exports = (pool) => {
    // Create new GitHub Credentials for user
    router.post('/credentials', (req, res) => {
        credentialController.createCredentials(req, res, pool);
    });

    // Get all user's available GitHub Credentials
    router.get('/credentials', (req, res) => {
        credentialController.getCredentials(req, res, pool);
    });

    // Edit user's GitHub Credentials
    router.patch('/credentials', (req, res) => {
        credentialController.editCredetials(req, res, pool);
    });

    // Delete user's GitHub Credentials
    router.delete('/credentials/:id', (req, res) => {
        credentialController.deleteCredetials(req, res, pool);
    });

    // Delete multiple GitHub Credentials from user
    router.post('/credentials/muldel', (req, res) => {
        credentialController.deleteMultipleCredetials(req, res, pool);
    });

    return router;
};
