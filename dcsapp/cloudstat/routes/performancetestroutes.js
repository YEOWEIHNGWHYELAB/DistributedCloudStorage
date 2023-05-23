const express = require('express');
const router = express.Router();
const performanceTest = require('../apicaller/performancetest');


module.exports = (pool) => {
    // Get my credential
    router.get('/pinglatencyauth', (req, res) => {
        performanceTest.getPingLatencyAuthenticated(req, res, pool);
    });

    return router;
}
