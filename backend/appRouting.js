const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController'); // Ini logikanya
router.post('/login', authController.login);                        // Ini pemanggilannya


module.exports = router;