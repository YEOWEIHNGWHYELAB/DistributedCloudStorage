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
        myVideosController.uploadVideo(null, req, res, pool, mongoYTTrackCollection);
    });

    // Upload multiple new videos
    router.post('/youtube/videos/mul', tempstorage.array('File'), async (req, res) => {
        try {
            const files = req.files;

            for (const file of files) {
                await myVideosController.uploadVideo(file, req, res, pool, mongoYTTrackCollection);
            }

            res.json({
                success: true,
                message: `Successfully uploaded all files!`
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Error uploading files.');
        }
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
