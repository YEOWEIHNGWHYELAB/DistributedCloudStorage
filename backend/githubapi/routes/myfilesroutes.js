const express = require('express');
const router = express.Router();
const myFilesController = require('../apicaller/myfiles');
const multer = require('multer');
const uploadsTempStorage = multer({ dest: '../../tempstorage/' });

module.exports = (pool) => {
    // Create new files for user
    router.post('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.createNewFile(req, res, pool, uploadsTempStorage);
    });

    // Get all user's available files
    router.get('/files', (req, res) => {
        myFilesController.getCredentials(req, res, pool);
    });

    // Edit user's filename
    router.patch('/files', (req, res) => {
        myFilesController.editCredetials(req, res, pool);
    });

    return router;
};
