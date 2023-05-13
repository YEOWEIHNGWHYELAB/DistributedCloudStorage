const express = require('express');
const router = express.Router();
const ytDirectController = require('../apicaller/ytvideodirect');


module.exports = (pool) => {
    router.post('/ytdirect', (req, res) => {
        ytDirectController.listVideo(req, res);
    });

    return router;
}
