const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController');
router.post('/login', authController.login);

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register);

const editProfilController = require('./src/controllers/EditProfilController'); // Sesuaikan path-nya jika beda
router.put('/profile/basic', editProfilController.updateBasic);
router.put('/profile/academic', editProfilController.updateAcademic);

const materiController = require('./src/controllers/MateriController');
router.get('/materi', materiController.getMateriBySubject);
router.get('/materi/all', materiController.getAllMateri);
router.get('/mapel', materiController.getAllMapel);

const feedbackController = require('./src/controllers/feedbackController');
router.post('/feedback', feedbackController.submitFeedback);

const historyController = require('./src/controllers/historyController');
router.get('/history/:role/:id', historyController.getHistory);
router.get('/active/:role/:id', historyController.getActiveSchedule);

const bankerController = require('./src/controllers/BankerController');
router.get('/sesi/detail/:id', bankerController.getSesiDetail);
router.put('/sesi/bayar-simulasi', bankerController.bayarSimulasi);
const pemesananController = require('./src/controllers/pemesananController');
router.get('/pemesanan/materi', pemesananController.getMateriDropdown);
router.post('/pemesanan/tambah', pemesananController.tambahPemesanan);

const matchingController = require('./src/controllers/matchingController');
router.get('/permintaan-baru', matchingController.getPermintaanBaru);
router.post('/terima-permintaan', matchingController.terimaPermintaanSesi);
router.get('/sesi-dikonfirmasi', matchingController.getSesiDikonfirmasi);

const chatController = require('./src/controllers/chatController'); // Pastikan path benar
router.get('/chats', chatController.getChatList);
router.get('/chats/messages/:id_guru/:id_murid', chatController.getMessages);
router.post('/chats/send', chatController.sendMessage);

module.exports = router;