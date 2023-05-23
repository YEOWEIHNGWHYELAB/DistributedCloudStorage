const express = require('express');
const router = express.Router();
const cloudFileStat = require('../apicaller/cloudfiles');


module.exports = (pool) => {
    // Get my credential
    router.get('/filestat', (req, res) => {
        cloudFileStat.getFileStat(req, res, pool);
    });

    return router;
}
