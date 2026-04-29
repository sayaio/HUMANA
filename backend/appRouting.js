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
router.get('/mapel', materiController.getAllMapel);

const feedbackController = require('./src/controllers/feedbackController');
router.post('/', feedbackController.berikanFeedback);
router.get('/guru/:id_guru', feedbackController.getFeedbackByGuru);

const editProfilController = require('./src/controllers/editProfilController')
router.put('/profile/basic', editProfilController.updateBasic);
router.put('/profile/academic', editProfilController.updateAcademic);

module.exports = router;