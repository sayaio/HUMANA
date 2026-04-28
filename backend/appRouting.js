const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController');
router.post('/login', authController.login);   

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register); 


const historyController = require('./src/controllers/historyController');
router.get('/history/:role/:id', historyController.getHistory);

const materiController = require('./src/controllers/MateriController');
router.get('/materi', materiController.getMateriBySubject);
router.get('/materi/all', materiController.getAllMateri);

<<<<<<< HEAD
const FeedbackController = require('../controllers/FeedbackController');
router.post('/', FeedbackController.berikanFeedback);
router.get('/guru/:id_guru', FeedbackController.getFeedbackByGuru);
=======
>>>>>>> a37ea484d64041f8a50bca34142285fab21dc795

module.exports = router;