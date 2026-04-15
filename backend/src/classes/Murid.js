const User = require('./User');

class Murid extends User{
  #kelas;
  #saldo;
  constructor(id_user, username, email, password, nama_user, kelas) {
    super(id_user, username, email, password, nama_user);
    this.kelas    = kelas;
    this._saldo   = 0;
  }

  getRole() {
    // TODO: return 'MURID'
  }
 
  topUpBalance() {
    // TODO: tambah saldo — validasi nominal > 0
  }
 
  getBalance() {
    // TODO: return this._saldo
  }
 
  pesanSesi() {
    // TODO: buat PemesananSesi baru — validasi saldo cukup
  }
 
  getOrderHistory() {
    // TODO: return histori semua pemesanan murid ini
  }
 
  batalkanPemesanan() {
    // TODO: batalkan pemesanan — validasi status masih PENDING
  }
 
  beriFeedback() {
    // TODO: buat Feedback baru setelah sesi selesai
  }
 
  receiveNotification() {
    // TODO: terima notifikasi (override)
  }

  get saldo() { return this._saldo; }
}

module.exports = Murid;
