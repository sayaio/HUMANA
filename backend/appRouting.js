const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController');
router.post('/login', authController.login);

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register);

<<<<<<< HEAD
const historyController = require('./src/controllers/historyController');
router.get('/history/:role/:id', historyController.getHistory);
=======
const materiController = require('./src/controllers/MateriController');
router.get('/materi', materiController.getMateriBySubject);
router.get('/materi/all', materiController.getAllMateri);

>>>>>>> b34a4592d01dabe723059d306539a699e7c7e9ea
module.exports = router;