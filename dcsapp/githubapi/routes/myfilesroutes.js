const express = require('express');
const router = express.Router();
const myFilesController = require('../apicaller/myfiles');
const multer = require('multer');
const uploadsTempStorage = multer({ dest: '../../tempstorage/' });

module.exports = (pool) => {
    /**
     * Basic CRUD operations
     */
    // Create new files for user
    router.post('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.createNewFile(req, res, pool);
    });

    // Get all user's available files
    router.get('/files', (req, res) => {
        myFilesController.getAllFiles(req, res, pool);
    });

    // Rename the user selected file
    router.patch('/files', (req, res) => {
        myFilesController.renameFile(req, res, pool);
    });

    // Soft delete the user selected file
    router.delete('/files/:id', (req, res) => {
        myFilesController.deleteFiles(req, res, pool);
    });

    /**
     * Advanced operations
     */
    // Obtain download link for file
    // router.get('/getfiles', )

    // Replace the user's file
    /*
    router.patch('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.replaceFile(req, res, pool);
    });*/

    // Perform multiple soft delete on selected files

    return router;
};
