const express = require('express');
const router = express.Router();
const myAccountStat = require('../apicaller/accountstat');

module.exports = (pool) => {
    // Get all repo storage size by personal access token  
    router.post('/repostat', (req, res) => {
        myAccountStat.getRepositoriesSize(req, res, pool);
    });

    return router;
};
