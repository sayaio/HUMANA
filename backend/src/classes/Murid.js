const User             = require('./User');
const PemesananSesi    = require('./PemesananSesi');
const Feedback         = require('./Feedback');

class Murid extends User {
  #kelas;
  #saldo;
  #orderHistory;

  constructor(username, email, password, nama_user, id = null, kelas = ''){
    super(username, email, password, nama_user, id);
    this.#kelas        = kelas;
    this.#saldo        = 0;
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
   *
   * Alur:
   * 1. Validasi input jadwal dan lokasi
   * 2. Cari guru terdekat yang tersedia via MatchmakingService
   * 3. Cek apakah saldo cukup untuk membayar
   * 4. Kurangi saldo, buat PemesananSesi, simpan ke history
   *
   * @param {string} materi         - nama materi, misal 'Matematika'
   * @param {object} jadwal         - { jamMulai: 'HH:MM', jamSelesai: 'HH:MM', tanggal: 'YYYY-MM-DD' }
   * @param {object} lokasiMurid    - { lat: number, lng: number }
   * @param {MatchmakingService} matchmakingService
   * @returns {PemesananSesi}
   *
   * Contoh pemakaian:
   *   const pemesanan = murid.pesanSesi(
   *     'Matematika',
   *     { jamMulai: '07:00', jamSelesai: '09:00', tanggal: '2026-05-01' },
   *     { lat: -6.9175, lng: 107.6191 },
   *     matchmakingService
   *   );
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
}

module.exports = Murid;