const express = require('express');
const router = express.Router();
const myFilesController = require('../apicaller/myfiles');
const myFilesAdvancedController = require('../apicaller/advancedmyfiles');
const multer = require('multer');
const uploadsTempStorage = multer({ dest: '../tempstorage/' });


module.exports = (pool) => {
    /**
     * Basic CRUD operations
     */
    // Create new files for user
    router.post('/files', uploadsTempStorage.single('File'), (req, res) => {
        myFilesController.createNewFile(null, req, res, pool);
    });

    // Create multiple new files for user
    router.post('/files/mul', uploadsTempStorage.array('File'), async (req, res) => {
        try {
            const files = req.files;

            for (const file of files) {
                await myFilesController.createNewFile(file, req, res, pool);
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
    // Get all files in a paginated format
    router.post('/filespag', (req, res) => {
        myFilesAdvancedController.getFilesPag(req, res, pool);
    })

    // Obtain download link for a file
    router.post('/files/getfiles', (req, res) => {
        myFilesAdvancedController.getDownloadLink(req, res, pool);
    })

    // Perform multiple soft delete on selected files
    router.post('/files/muldel', (req, res) => {
        myFilesAdvancedController.multipleDelete(req, res, pool);
    });

    return router;
};
