const express = require('express');
const router = express.Router();
const myVideosController = require('../apicaller/myvideos');
const multer = require('multer');
const tempstorage = multer({ dest: '../../tempstorage/' });


module.exports = (pool) => {
    router.post('/youtube', tempstorage.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), (req, res) => {
        myVideosController.uploadVideo(req, res, pool);
    });

    router.patch('/youtube', (req, res) => {
        myVideosController.editVideoMeta(req, res, pool);
    });

    router.delete('/youtube', (req, res) => {
        myVideosController.deleteVideo(req, res, pool);
    });

    return router;
};