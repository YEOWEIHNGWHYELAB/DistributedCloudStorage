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

    router.get('/whoami', (req, res) => {
        authController.getUsername(req, res);
    });

    return router;
};
