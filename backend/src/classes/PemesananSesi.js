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
        // Tangani konversi Date object bawaan MariaDB ke ISO String jika diperlukan
        const mulaiStr = this.#waktuMulai instanceof Date ? this.#waktuMulai.toISOString() : this.#waktuMulai;
        const selesaiStr = this.#waktuSelesai instanceof Date ? this.#waktuSelesai.toISOString() : this.#waktuSelesai;

        // Substring '11, 16' mengambil format HH:MM dari ISO String
        const jamMulaiText = mulaiStr ? mulaiStr.substring(11, 16) : "";
        const jamSelesaiText = selesaiStr ? selesaiStr.substring(11, 16) : "";

        const rincianBiaya = this.HitungTotalBiaya(this.jarak_km);

        return {
            id_pemesanan: this.id_pemesanan,
            nama_murid: this.murid,
            nama_materi: this.materi,
            status_pemesanan: this.statusPemesanan,
            // Satukan waktu langsung dari backend
            waktu_string: jamMulaiText && jamSelesaiText ? `${jamMulaiText} – ${jamSelesaiText}` : "Waktu tidak valid",
            jarak_km: parseFloat(this.jarak_km.toFixed(2)),
            // SAMAKAN NAMA PROPERTI DENGAN FRONTEND
            lokasi_sesi: this.#lokasiSesi,
            // Ekspos harga_total agar formatRupiah(item.harga_total) di frontend langsung jalan
            harga_total: rincianBiaya.totalPembayaran
        };
    }
}

module.exports = PemesananSesi;