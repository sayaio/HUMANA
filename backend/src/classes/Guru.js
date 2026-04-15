const User = require('./User');

class Guru extends User{
  #portofolio;
  #meanRating;
  #daftarMateri;
  #jadwalAvailable;
  #totalSesi;
  constructor(id, username, email, password, nama_user) {
    super(id, username, email, password, nama_user);
    this.portfolio        = [];
    this.meanRating       = 0;
    this.daftarMateri     = [];
    this.jadwalAvailable  = [];
    this._totalSesi       = 0;
  }
  
  getRole() {
    // TODO: return 'GURU'
  }
 
  tambahJadwal() {
    // TODO: tambah slot jadwal ke jadwalAvailable
  }
 
  hapusJadwal() {
    // TODO: hapus slot jadwal dari jadwalAvailable
  }

  getJadwalAvailable() {
    // TODO: return daftar jadwal yang tersedia
  }
 
  konfirmasiPesanan() {
    // TODO: konfirmasi atau tolak pemesanan dari murid
  }
 
  getPemesananSesi() {
    // TODO: return semua sesi yang dipesan untuk guru ini
  }
 
  getRating() {
    // TODO: hitung dan return rata-rata rating dari Feedback
  }
 
  addNewReview() {
    // TODO: tambah review baru ke daftar feedback
  }
 
  receiveNotification() {
    // TODO: terima notifikasi (override)
  }
 
  getRiwayatSesi() {
    // TODO: return histori semua sesi yang sudah selesai
  }

  get totalSesi() { return this._totalSesi; }
}

module.exports = Guru;
