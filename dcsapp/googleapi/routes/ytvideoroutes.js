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
        let error = null;

        try {
            myVideosController.uploadVideo(null, req, res, pool, mongoYTTrackCollection);
        } catch(err) {
            error = err;
        }

        if (error) {
            res.json({ success: false, message: "Failed to upload!" });
        } else {
            res.json({
                success: true,
                message: "Video uploaded successfully"
            });
        }
    });

    // Upload multiple new videos
    router.post('/youtube/videos/mul', tempstorage.array('File'), async (req, res, next) => {
        const files = req.files;
        let error = null;

        for (const file of files) {
            try {
                await myVideosController.uploadVideo(file, req, res, pool, mongoYTTrackCollection);
            } catch (err) {
                error = err;
                break;
            }
        }

        if (error) {
            res.json({ success: false, message: "Failed to upload!" })
        } else {
            res.json({ success: true, message: "Upload completed!" });
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
