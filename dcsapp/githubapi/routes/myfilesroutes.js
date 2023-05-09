const express = require('express');
const router = express.Router();
const myFilesController = require('../apicaller/myfiles');
const multer = require('multer');
const uploadsTempStorage = multer({ dest: '../../tempstorage/' });

module.exports = (pool) => {
    // Create new files for user
    router.post('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.createNewFile(req, res, pool);
    });

    // Get all user's available files
    router.get('/files', (req, res) => {
        myFilesController.getAllFiles(req, res, pool);
    });

    // Replace the user's file
    router.patch('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.replaceFile(req, res, pool);
    });

    return router;
};
