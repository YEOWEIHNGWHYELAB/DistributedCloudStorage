const express = require('express');
const router = express.Router();
const myCredentials = require('../apicaller/credentialsyt');


module.exports = (pool) => {
    // Get my credential
    router.get('/credentialsyt', (req, res) => {
        myCredentials.getCredentials(req, res, pool);
    });

    // Kick start to obtain the refresh token
    router.post('/credkickstartyt', (req, res) => {
        myCredentials.kickStartCredentialsYT(req, res, pool);
    });

    // Upload new Google Credentials for user
    router.post('/credentialsyt', (req, res) => {
        myCredentials.createCredentialsYT(req, res, pool);
    });

    // Update new Google Credentials email for user
    router.patch('/credentialsyt', (req, res) => {
        myCredentials.updateCredentialsYT(req, res, pool);
    });

    // Delete Google Credential for user
    router.delete('/credentialsyt/:id', (req, res) => {
        myCredentials.deleteCredentialsYT(req, res, pool);
    });

    // Delete Multiple Google Credentials for user
    router.post('/credentialsyt/muldel', (req, res) => {
        myCredentials.deleteCredentialsYTMulDel(req, res, pool);
    });

    return router;
}
