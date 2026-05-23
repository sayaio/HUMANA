class PemesananSesi {
    #id_pemesanan;
    #murid;
    #guru;
    #sesi;
    #materi;
    #statusPemesanan;
    #waktuPemesanan;
    #pembayaran;
    #waktuMulai;
    #waktuSelesai;
    #lokasiSesi;

    constructor(murid, guru, materi, waktuMulai, waktuSelesai, lokasiSesi) {
        this.id_pemesanan = null;
        this.murid = murid;
        this.guru = guru;
        this.sesi = null;
        this.materi = materi;
        this.statusPemesanan = "menunggu konfirmasi";
        this.waktuPesan = new Date();
        this.pembayaran = null;

        this.#waktuMulai = waktuMulai;
        this.#waktuSelesai = waktuSelesai;
        this.#lokasiSesi = lokasiSesi;

        this.jarak_km = 0;
    }

    HitungDurasiJam() {
        const mulai = new Date(this.#waktuMulai);
        const selesai = new Date(this.#waktuSelesai);
        const selisihMilidetik = selesai - mulai;
        const durasiJam = selisihMilidetik / (1000 * 60 * 60);
        return durasiJam > 0 ? durasiJam : 0;
    }

    // Fungsi Utama: Menghitung total biaya berdasarkan tarif yang kamu tentukan
    HitungTotalBiaya(jarakKm) {
        const tarifPerJam = 30000;
        const tarifPerKm = 3000;
        const totalJam = this.HitungDurasiJam();
        const biayaBelajar = totalJam * tarifPerJam;
        const biayaTransport = jarakKm * tarifPerKm;

        return {
            biayaPembelajaran: Math.round(biayaBelajar),
            biayaTransportGuru: Math.round(biayaTransport),
            totalPembayaran: Math.round(biayaBelajar + biayaTransport)
        };
    }

    getInvoice() {
        return `INV-${this.id_pemesanan}-${this.waktuPesan.getTime()}`;
    }

    konfirmasi() {
        this.statusPemesanan = "dikonfirmasi";
    }

    batalkan() {
        this.statusPemesanan = "dibatalkan";
    }

    setPembayaran(pembayaran) {
        this.pembayaran = pembayaran;
    }

    toJSON() {
        const jamMulaiText = this.#waktuMulai ? this.#waktuMulai.substring(11, 16) : "";
        const jamSelesaiText = this.#waktuSelesai ? this.#waktuSelesai.substring(11, 16) : "";

        return {
            id_pemesanan: this.id_pemesanan,
            nama_murid: this.murid,
            nama_materi: this.materi,
            status_pemesanan: this.statusPemesanan,
            waktu_string: `${jamMulaiText} – ${jamSelesaiText}`,
            durasi_jam: this.HitungDurasiJam(),
            jarak_km: parseFloat(this.jarak_km.toFixed(2)),
            lokasi_koordinat: this.#lokasiSesi,
            rincian: this.HitungTotalBiaya(this.jarak_km)
        };
    }
}

module.exports = PemesananSesi;