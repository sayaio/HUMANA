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
        // Buat helper function internal untuk mengubah Date object atau string dari DB menjadi format HH:MM lokal
        const formatKeJamLokal = (waktuRaw) => {
            if (!waktuRaw) return "";

            // Bungkus ke objek Date jika bentukannya masih string dari database
            const dateObj = waktuRaw instanceof Date ? waktuRaw : new Date(waktuRaw);

            // Cek apakah parsing date berhasil/valid
            if (isNaN(dateObj.getTime())) return "";

            // Ambil waktu lokal (WIB jika dijalankan di server lokal / device Indonesia) tanpa konversi UTC
            return dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace('.', ':'); // Mengganti pemisah titik bawaan id-ID menjadi titik dua (:)
        };
        const jamMulaiText = formatKeJamLokal(this.#waktuMulai);
        const jamSelesaiText = formatKeJamLokal(this.#waktuSelesai);
        const rincianBiaya = this.HitungTotalBiaya(this.jarak_km);
        return {
            id_pemesanan: this.id_pemesanan,
            nama_murid: this.murid,
            nama_materi: this.materi,
            status_pemesanan: this.statusPemesanan,
            // Sekarang waktu_string akan menghasilkan jam lokal yang pas (07:30 – 09:30)
            waktu_string: jamMulaiText && jamSelesaiText ? `${jamMulaiText} – ${jamSelesaiText}` : "Waktu tidak valid",
            jarak_km: parseFloat(this.jarak_km.toFixed(2)),
            lokasi_sesi: this.#lokasiSesi,
            biaya_sesi: rincianBiaya.biayaPembelajaran,
            biaya_jarak: rincianBiaya.biayaTransportGuru,
            harga_total: rincianBiaya.totalPembayaran
        };
    }
}
module.exports = PemesananSesi;