const express = require("express");
const router = express.Router();
const smcoController = require("../apicaller/smcofiles");

module.exports = (pool) => {
    // Get all user's file paginated
    router.post("/filespag", (req, res) => {
        smcoController.getAllFiles(req, res, pool);
    });

    // Add directories
    router.post("/mkdir", (req, res) => {
        smcoController.mkDir(req, res, pool);
    });

    router.post("/cdfiles", (req, res) => {
        smcoController.changeFileDir(req, res, pool);
    });

    router.post("/cdfolder", (req, res) => {
        smcoController.changeFolderDir(req, res, pool);
    });

    return router;
};
