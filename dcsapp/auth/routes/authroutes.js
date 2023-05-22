const express = require('express');
const router = express.Router();
const authController = require('../apicaller/auth');

module.exports = (pool, sgMail) => {
    // Register user
    router.post('/register', (req, res) => {
        authController.register(req, res, pool);
    });

    // Login user
    router.post('/login', (req, res) => {
        authController.login(req, res, pool);
    });

    // Change Password
    router.post('/resetpwd', (req, res) => {
        authController.changePassword(req, res, pool);
    });

    // Forgot Password
    router.post('/forgotpwd', (req, res) => {
        authController.forgotPasswordKickStart(req, res, pool, sgMail);
    });

    // Confirm Forgot Password
    router.post('/confirmforgotpwd', (req, res) => {
        authController.forgotPasswordConfirm(req, res, pool, sgMail);
    });

    // User self-identify
    router.get('/whoami', (req, res) => {
        authController.getUsername(req, res, pool);
    });

    return router;
};
