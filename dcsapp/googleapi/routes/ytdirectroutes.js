const express = require('express');
const router = express.Router();
const statyt = require('../apicaller/statyt')


module.exports = (pool) => {
    router.get('/youtube/videostat', (req, res) => {
        statyt.getPublicChannelStat(req, res, pool);
    });

    return router;
}
