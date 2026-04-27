const User = require('./User');
const Availability = require('./Availability'); // Pastikan ini di-require
const Feedback = require('./Feedback');

class Guru extends User{
  #portofolio;
  #daftarMateri;
  #daftarAvailability;
  #riwayatSesi;
  #daftarPesanan;
  #daftarFeedback;

  constructor(username, email, password, nama_user) {
    super(username, email, password, nama_user);
    
    // Inisialisasi variabel sesuai deklarasi private di atas
    this.#portofolio = [];
    this.#daftarMateri = [];
    this.#daftarAvailability = [];
    this.#riwayatSesi = [];
    this.#daftarPesanan = [];
    this.#daftarFeedback = [];
  }
  
  getRole() {
    return "Guru";
  }
 
  getPortofolio(){
    return this.#portofolio;
  }

  tambahJadwal(waktuMulai, waktuSelesai) {
    const jadwalBaru = new Availability(waktuMulai, waktuSelesai);
    this.#daftarAvailability.push(jadwalBaru);
    console.log(`Jadwal baru berhasil ditambahkan untuk Guru ${this.namaUser}.`);
  }
  
  hapusJadwal(id) {
    const index = this.#daftarAvailability.findIndex(a => a.idAvailability === id);
    if (index !== -1) {
      this.#daftarAvailability.splice(index, 1);
      console.log("Jadwal ketersediaan berhasil dihapus.");
      return true;
    }
    return false;
  }

  getJadwalAvailable(waktuCek) {
    // waktuCek harus berupa objek Date
    return this.#daftarAvailability.filter(a => a.isAvailable(waktuCek));
  }

  konfirmasiPesanan(idPesanan, status) {
    const pesanan = this.#daftarPesanan.find(p => p.id === idPesanan);
    if (pesanan) {
      pesanan.status = status;
      console.log(`Pesanan ${idPesanan} telah ${status}.`);
    }
  }

  getPemesananSesi() {
    return this.#daftarPesanan;
  }

  getRating() {
    if (this.#daftarFeedback.length === 0) return 0;
    
    const total = this.#daftarFeedback.reduce((acc, f) => {
      // Memanggil getter getRating() sesuai gambar class Feedback Anda
      return acc + f.getRating();
    }, 0);
    
    return total / this.#daftarFeedback.length;
  }

  receiveNotification(pesan) {
    console.log(`Notifikasi Guru: ${pesan}`);
  }

  getRiwayatSesi(){
    return this.#riwayatSesi;
  }

  addFeedback(feedback) {
    // Validasi sederhana untuk memastikan yang dimasukkan adalah objek feedback
    if (feedback instanceof Feedback) {
      this.#daftarFeedback.push(feedback);
      console.log(`Feedback baru berhasil ditambahkan untuk ${this.namaUser}.`);
      return true;
    } else {
      console.error("Gagal: Data yang dimasukkan bukan objek Feedback.");
      return false;
    }
  }

}
module.exports = Guru;
