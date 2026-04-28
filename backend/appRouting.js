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
const feedbackController = require('./src/controllers/feedbackController');
router.post('/', feedbackController.berikanFeedback);
router.get('/guru/:id_guru', feedbackController.getFeedbackByGuru);
>>>>>>> c58a17e1a0483ce4b5fdf0799b676c4ebae386cb

module.exports = router;