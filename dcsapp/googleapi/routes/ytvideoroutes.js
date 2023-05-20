const express = require('express');
const router = express.Router();
const myVideosController = require('../apicaller/myvideos');
const multer = require('multer');
const tempstorage = multer({ dest: '../../tempstorage/' });


module.exports = (pool, mongoYTTrackCollection) => {
    // Upload new video
    router.post('/youtube/videos', tempstorage.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), (req, res) => {
        myVideosController.uploadVideo(req, res, pool, mongoYTTrackCollection);
    });

    router.post('/youtube/videospag', (req, res) => {
        myVideosController.getVideosPag(req, res, pool);
    });

    router.patch('/youtube/videos', (req, res) => {
        myVideosController.editVideoMeta(req, res, pool);
    });

    router.post('/youtube/videos/muldel', (req, res) => {
        myVideosController.deleteVideoSoft(req, res, pool);
    });

    router.delete('/youtube/videos/:id', (req, res) => {
        myVideosController.deleteVideoHard(req, res, pool);
    });

    return router;
};
