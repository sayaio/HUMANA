const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController'); // Ini logikanya
router.post('/login', authController.login);   

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register); 

const historyController = require('./src/controllers/historyController');
router.get('/history/:role/:id', historyController.getHistory);
module.exports = router;