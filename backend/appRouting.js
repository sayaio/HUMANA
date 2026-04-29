const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController');
router.post('/login', authController.login);

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register);

const materiController = require('./src/controllers/MateriController');
router.get('/materi', materiController.getMateriBySubject);
router.get('/materi/all', materiController.getAllMateri);
router.get('/mapel', materiController.getAllMapel);

const feedbackController = require('./src/controllers/feedbackController');
router.post('/', feedbackController.berikanFeedback);
router.get('/guru/:id_guru', feedbackController.getFeedbackByGuru);

const historyController = require('./src/controllers/HistoryController'); // tambah ini
router.get('/history/:role/:id', historyController.getHistory);           // tambah ini

module.exports = router;