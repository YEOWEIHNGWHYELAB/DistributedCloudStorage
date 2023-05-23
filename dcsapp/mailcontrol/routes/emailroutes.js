const express = require("express");
const router = express.Router();
const emailController = require("../apicaller/emailapicaller");

module.exports = (pool, sgMail) => {
    // Register user
    router.post("/contactus", (req, res) => {
        emailController.contactus(req, res, sgMail);
    });
 
    return router;
};
