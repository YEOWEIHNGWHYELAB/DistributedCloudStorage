const express = require("express");
const router = express.Router();
const smcoController = require("../apicaller/smcofiles");

module.exports = (pool) => {
    // Get all user's file paginated
    router.post("/filespag", (req, res) => {
        smcoController.getAllFiles(req, res, pool);
    });

    return router;
};
