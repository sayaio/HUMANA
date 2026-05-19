const User = require('./User');
const PemesananSesi = require('./PemesananSesi');
const Feedback = require('./Feedback');

class Murid extends User {
    #kelas;
    #saldo;
    #orderHistory;
    #noTelepon;
    #jenisKelamin;
    #alamat;
    #jurusan;

    constructor(username, email, password, nama_user, id = null, kelas = '', no_telepon = '', jenis_kelamin = '', alamat = '', jurusan = '') {
        super(username, email, password, nama_user, id);
        this.#kelas = kelas;
        this.#noTelepon = no_telepon;
        this.setJenisKelamin(jenis_kelamin);
        this.#alamat = alamat;
        this.#jurusan = jurusan;
        this.#saldo = 0;
        this.#orderHistory = [];
    }

    getRole() {
        return 'MURID';
    }

    topUpBalance(amount) {
        if (amount > 0) {
            this.#saldo += amount;
        }
    }

    getBalance() {
        return this.#saldo;
    }

    /**
     * Memesan sesi les.
     */
    pesanSesi(materi, jadwal, lokasiMurid, matchmakingService) {
        // 1. Validasi input
        if (!materi || typeof materi !== 'string') {
            throw new Error('Materi tidak valid');
        }
        if (!jadwal?.jamMulai || !jadwal?.jamSelesai || !jadwal?.tanggal) {
            throw new Error('Jadwal tidak lengkap. Harap isi jamMulai, jamSelesai, dan tanggal');
        }
        if (!lokasiMurid?.lat || !lokasiMurid?.lng) {
            throw new Error('Lokasi murid tidak valid');
        }

        // 2. Cari guru terdekat yang tersedia (bisa throw Error jika tidak ada)
        const { guru, nominal } = matchmakingService.cariGuruTerdekat(
            lokasiMurid,
            jadwal,
            materi
        );

        // 3. Cek saldo
        if (this.#saldo < nominal) {
            throw new Error(
                `Saldo tidak cukup. Dibutuhkan Rp${nominal.toLocaleString('id-ID')}, ` +
                `saldo kamu Rp${this.#saldo.toLocaleString('id-ID')}`
            );
        }

        // 4. Kurangi saldo, buat pemesanan, simpan ke history
        this.#saldo -= nominal;

        const pemesanan = new PemesananSesi(
            null,
            this,
            guru,
            jadwal,
            materi,
            'PENDING',
            nominal
        );

        this.#orderHistory.push(pemesanan);
        return pemesanan;
    }

    getOrderHistory() {
        return this.#orderHistory;
    }

    batalkanPemesanan(p) {
        const index = this.#orderHistory.indexOf(p);
        if (index > -1) {
            const berhasil = p.batalkan();
            if (berhasil) {
                this.#saldo += p.getNominalPembayaran?.() ?? 0;
            }
        }
    }

    beriFeedback(p, rating, komentar) {
        const feedback = new Feedback(
            null,
            rating,
            komentar,
            p.jadwal?.lokasi ?? null,
            this,
            p.guru
        );
        if (typeof p.setFeedback === 'function') {
            p.setFeedback(feedback);
        }
        return feedback;
    }

    receiveNotification(message) {
        console.log(`Notifikasi untuk ${this.getProfile().nama}: ${message}`);
    }

    getKelas() { return this.#kelas; }
    setKelas(kelas) { this.#kelas = kelas; }

    getJenjang() {
        const k = parseInt(this.#kelas, 10);
        if (k >= 1 && k <= 6) return 'SD';
        if (k >= 7 && k <= 9) return 'SMP';
        if (k >= 10 && k <= 12) return 'SMA';
        return '-';
    }

    setJenisKelamin(jenisKelamin) {
        if (jenisKelamin === 'L') this.#jenisKelamin = 'Laki-laki';
        else if (jenisKelamin === 'P') this.#jenisKelamin = 'Perempuan';
    }

    getKelasJurusan() {
        const kelas = this.#kelas;
        const jurusanClean = (this.#jurusan && this.#jurusan !== '(NULL)') ? this.#jurusan : '-';

        if (kelas && kelas !== '-' && jurusanClean !== '-') {
            return `${kelas} - ${jurusanClean}`;
        }
        return kelas || '-';
    }

    // 🛠️ BAGIAN YANG DIPERBAIKI 🛠️
    getProfile() {
        const baseProfile = super.getProfile();
        const jurusanClean = (this.#jurusan && this.#jurusan !== '(NULL)') ? this.#jurusan : '-';

        // Ambil nama dari baseProfile entah key-nya 'name' atau 'nama'
        const currentName = baseProfile.name || baseProfile.nama || '-';

        return {
            ...baseProfile,
            name: currentName,                  // Untuk kebutuhan komponen Frontend (ProfilePage.jsx)
            nama: currentName,                  // Untuk kebutuhan internal Backend (receiveNotification)
            role: this.getRole(),               // 🔥 FIX: Supaya profileData.role tidak undefined di App.jsx
            kelas: this.#kelas || '-',
            no_telepon: this.#noTelepon || '-',
            alamat: this.#alamat || '-',
            jenis_kelamin: this.#jenisKelamin || '-',
            jurusan: jurusanClean,
            jenjang_pendidikan: this.getJenjang(),
            kelas_jurusan: this.getKelasJurusan()
        };
    }
}

module.exports = Murid;