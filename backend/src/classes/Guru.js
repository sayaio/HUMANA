const User = require('./User');
const Availability = require('./Availability'); // Pastikan ini di-require
const Feedback = require('./Feedback');

class Guru extends User {
    #portofolio;
    #daftarMateri;
    #riwayatSesi;
    #daftarPesanan;
    #daftarFeedback;
    #isActive;
    #noTelepon;
    #jenisKelamin;
    #alamat;

    constructor(username, email, password, nama_user, id, isActive, no_telepon = '', jenis_kelamin = '', alamat = '') {
        super(username, email, password, nama_user, id);

        this.#portofolio = [];
        this.#daftarMateri = [];
        this.#riwayatSesi = [];
        this.#daftarPesanan = [];
        this.#daftarFeedback = [];
        this.#isActive = isActive;
        this.#noTelepon = no_telepon;
        this.setJenisKelamin(jenis_kelamin);
        this.#alamat = alamat;
    }

    getRole() {
        return "Guru";
    }

    getPortofolio() {
        return this.#portofolio;
    }

    konfirmasiPesanan(idPesanan, status) {
        // 1. Pastikan array sudah diinisialisasi di constructor
        if (!this.#daftarPesanan) {
            console.error("Gagal: Daftar pesanan belum diinisialisasi.");
            return false;
        }

        // 2. Cari pesanan berdasarkan ID
        const pesanan = this.#daftarPesanan.find(p => p.id === idPesanan);

        if (pesanan) {
            // 3. Update status (misal: 'Diterima', 'Ditolak', atau 'Selesai')
            pesanan.status = status;
            console.log(`Sistem: Pesanan ID ${idPesanan} telah diubah menjadi "${status}".`);
            return true;
        }

        console.error(`Gagal: Pesanan dengan ID ${idPesanan} tidak ditemukan.`);
        return false;
    }

    getPemesananSesi() {
        return this.#daftarPesanan;
    }

    getRating() {
        if (this.#daftarFeedback.length === 0) return 0;
        console.log(this.#daftarFeedback);
        const total = this.#daftarFeedback.reduce((acc, f) => {
            // Memanggil getter getRating() sesuai gambar class Feedback Anda
            return acc + f.getRating();
        }, 0);

        return total / this.#daftarFeedback.length;
    }

    receiveNotification(pesan) {
        console.log(`Notifikasi Guru: ${pesan}`);
    }

    getRiwayatSesi() {
        return this.#riwayatSesi;
    }

    addFeedback(feedback) {
        // Validasi sederhana untuk memastikan yang dimasukkan adalah objek feedback
        if (feedback instanceof Feedback) {
            this.#daftarFeedback.push(feedback);
            return true;
        } else {
            console.error("Gagal: Data yang dimasukkan bukan objek Feedback.");
            return false;
        }
    }

    get is_active() {
        return this.#isActive;
    }

    set is_active(value) {
        this.#isActive = value;
    }

    setJenisKelamin(jenisKelamin) {
        if (jenisKelamin === 'L') this.#jenisKelamin = 'Laki-laki';
        else if (jenisKelamin === 'P') this.#jenisKelamin = 'Perempuan';
        else this.#jenisKelamin = jenisKelamin;
    }
    
    getProfile() {
        const baseProfile = super.getProfile();
        const currentName = baseProfile.name || baseProfile.nama || baseProfile.nama_guru || '-';

        return {
            ...baseProfile,
            name: currentName,
            nama: currentName,
            role: this.getRole(),
            is_active: this.#isActive,
            // 🛠️ Ekspos data baru ke frontend agar tidak bernilai undefined/kosong
            no_telepon: this.#noTelepon || '-',
            jenis_kelamin: this.#jenisKelamin || '-',
            alamat: this.#alamat || '-',
            portofolio: this.#portofolio,
            daftarMateri: this.#daftarMateri,
            riwayatSesi: this.#riwayatSesi
        };
    }

}
module.exports = Guru;
