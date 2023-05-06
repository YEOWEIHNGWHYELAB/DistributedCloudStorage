const express = require('express');
const router = express.Router();
const authController = require('./auth');

module.exports = (pool) => {
    // Register user
    router.post('/register', (req, res) => {
        authController.register(req, res, pool);
    });

    // Login user
    router.post('/login', (req, res) => {
        authController.login(req, res, pool);
    });

    // Logout user
    router.post('/logout', (req, res) => {
        authController.logout(req, res, pool);
    });

    // User self-identify
    router.get('/whoami', (req, res) => {
        authController.getUsername(req, res, pool);
    });

    return router;
};
