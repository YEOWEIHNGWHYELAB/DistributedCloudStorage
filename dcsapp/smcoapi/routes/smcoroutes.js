const express = require("express");
const router = express.Router();
const smcoController = require("../apicaller/smcofiles");

module.exports = (pool) => {
    // Get all folders
    router.get("/filespag", (req, res) => {
        smcoController.getFolders(req, res, pool);
    });

    // Get all user's file paginated
    router.post("/filespag", (req, res) => {
        smcoController.getAllFiles(req, res, pool);
    });

    // Make directories
    router.post("/mkdir", (req, res) => {
        smcoController.mkDir(req, res, pool);
    });

    // Change file directory
    router.post("/cdfiles", (req, res) => {
        smcoController.changeFileDir(req, res, pool);
    });

    // Change folder directory
    router.post("/cdfolder", (req, res) => {
        smcoController.changeFolderDir(req, res, pool);
    });

    router.patch("/renamefiles", (req, res) => {
        smcoController.renameFiles(req, res, pool);
    });

    router.patch("/renamefolder", (req, res) => {
        smcoController.renameFolder(req, res, pool);
    });

    // Delete a folder and all its content
    router.post("/deletedir", (req, res) => {
        smcoController.deleteDir(req, res, pool);
    });

    return router;
};
