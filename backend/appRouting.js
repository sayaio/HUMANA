const express = require('express');
const router = express.Router();

const authController = require('./src/controllers/authController');
router.post('/login', authController.login);
router.get('/check-email', authController.checkEmail);
router.post('/login-google', authController.loginGoogle);

const registerController = require('./src/controllers/registerController');
router.post('/register', registerController.register);

const editProfilController = require('./src/controllers/EditProfilController'); // Sesuaikan path-nya jika beda
router.put('/profile/basic', editProfilController.updateBasic);
router.put('/profile/academic', editProfilController.updateAcademic);
router.put('/profile/availability', editProfilController.updateAvailability);

const materiController = require('./src/controllers/MateriController');
router.get('/materi', materiController.getMateriBySubject);
router.get('/materi/all', materiController.getAllMateri);
router.get('/mapel', materiController.getAllMapel);
router.post('/materi/guru', materiController.updateMateriGuru);

const feedbackController = require('./src/controllers/feedbackController');
router.post('/feedback', feedbackController.submitFeedback);
router.get('/profile-guru/:id_guru', feedbackController.getGuruRating);

const historyController = require('./src/controllers/historyController');
router.get('/history/:role/:id', historyController.getHistory);
router.get('/active/:role/:id', historyController.getActiveSchedule);

const bankerController = require('./src/controllers/BankerController');
router.get('/sesi/detail/:id', bankerController.getSesiDetail);
router.put('/sesi/bayar-simulasi', bankerController.bayarSimulasi);
router.post('/sesi/proses-midtrans', bankerController.prosesPembayaranMidtrans);
router.post('/sesi/proses-cod', bankerController.prosesPembayaranCod);

const webhookController = require('./src/controllers/webhookController');
router.post('/webhook/midtrans', webhookController.handleMidtrans);

const pemesananController = require('./src/controllers/pemesananController');
router.get('/pemesanan/materi', pemesananController.getMateriDropdown);
router.post('/pemesanan/tambah', pemesananController.tambahPemesanan);
router.get('/pemesanan/mapel', pemesananController.getMapelByJenjang);
router.get('/pemesanan/cek-status', pemesananController.cekStatusPemesananMurid);
router.delete('/pemesanan/batal/:id_pemesanan', pemesananController.batalPemesanan);
router.post('/pemesanan/save-draft', pemesananController.saveDraftPemesanan);
router.get('/pemesanan/get-draft/:id_murid', pemesananController.getDraftPemesanan);
router.delete('/pemesanan/clear-draft/:id_murid', pemesananController.clearDraftPemesanan);

const matchingController = require('./src/controllers/matchingController');
router.get('/permintaan-baru', matchingController.getPermintaanBaru);
router.post('/terima-permintaan', matchingController.terimaPermintaanSesi);
router.get('/sesi-dikonfirmasi', matchingController.getSesiDikonfirmasi);

const chatController = require('./src/controllers/chatController'); // Pastikan path benar
router.get('/chats', chatController.getChatList);
router.get('/chats/messages/:id_guru/:id_murid', chatController.getMessages);
router.post('/chats/send', chatController.sendMessage);
router.post('/chats/create', chatController.createOrGetChatRoom);

const portfolioController = require('./src/controllers/portfolioController');
router.get('/portfolio/:id_guru', portfolioController.getPortfolioByGuru);
router.post('/portfolio', portfolioController.tambahPortfolio);
router.delete('/portfolio/:id_portfolio', portfolioController.hapusPortfolio);

const { getPendapatan, getRiwayatPendapatan } = require('./src/controllers/pendapatanController');
router.get('/pendapatan/:id_guru', getPendapatan);
router.get('/pendapatan/:id_guru/riwayat', getRiwayatPendapatan);

const { batalSesiController } = require('./src/controllers/batalSesiController');
router.post('/pemesanan/batal', batalSesiController);

const { getDetailPemesanan } = require('./src/controllers/detailPemesananController');
router.get('/detailpemesanan/:id', getDetailPemesanan);

const materiGuruController = require('./src/controllers/materiGuruController');
router.get('/materi-guru/:id_guru', materiGuruController.getMateriGuru);
router.post('/materi-guru', materiGuruController.simpanMateriGuru);
router.delete('/materi-guru/:id_guru/:id_materi', materiGuruController.hapusMateriGuru);

module.exports = router;