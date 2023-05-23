const express = require('express');
const router = express.Router();
const performanceTest = require('../apicaller/cloudfiles');


module.exports = (pool) => {
    // Get my credential
    router.get('/pinglatency', (req, res) => {
        performanceTest.getFileStat(req, res, pool);
    });

    return router;
}
