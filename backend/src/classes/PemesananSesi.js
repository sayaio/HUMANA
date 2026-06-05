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
        this.id_pemesanan = null; // autoincrement db
        this.murid = murid;
        this.guru = guru;
        this.sesi = null;
        this.materi = materi;
        this.statusPemesanan = "menunggu konfirmasi";
        this.waktuPesan = new Date();
        this.pembayaran = null;

        // Properti private
        this.#waktuMulai = waktuMulai;
        this.#waktuSelesai = waktuSelesai;
        this.#lokasiSesi = lokasiSesi;
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

        const biayaPembelajaran = Math.round(biayaBelajar);
        const biayaTransportGuru = Math.ceil(biayaTransport / 10) * 10;

        return {
            biayaPembelajaran: biayaPembelajaran,
            biayaTransportGuru: biayaTransportGuru,
            totalPembayaran: biayaPembelajaran + biayaTransportGuru
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
        const formatKeJamLokal = (waktuRaw) => {
            if (!waktuRaw) return "";
            const dateObj = waktuRaw instanceof Date ? waktuRaw : new Date(waktuRaw);
            if (isNaN(dateObj.getTime())) return "";
            return dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace('.', ':');
        };

        const jamMulaiText = formatKeJamLokal(this.#waktuMulai);
        const jamSelesaiText = formatKeJamLokal(this.#waktuSelesai);

        // PERBAIKAN: Berikan nilai fallback 0 jika this.jarak_km tidak ada/undefined
        const jarak = this.jarak_km || 0;
        const rincianBiaya = this.HitungTotalBiaya(jarak);

        const lokasiAddressOnly = this.#lokasiSesi && this.#lokasiSesi.includes('|') 
            ? this.#lokasiSesi.split('|')[1] 
            : this.#lokasiSesi;
            
        let koordinatObj = null;
        if (this.#lokasiSesi && this.#lokasiSesi.includes('|')) {
            const coords = this.#lokasiSesi.split('|')[0].split(',');
            if (coords.length === 2) {
                koordinatObj = {
                    latitude: Number(coords[0]),
                    longitude: Number(coords[1])
                };
            }
        }

        return {
            id_pemesanan: this.id_pemesanan,
            nama_murid: this.murid,
            nama_materi: this.materi,
            status_pemesanan: this.statusPemesanan,
            waktu_string: jamMulaiText && jamSelesaiText ? `${jamMulaiText} – ${jamSelesaiText}` : "Waktu tidak valid",
            // PERBAIKAN: Gunakan variabel 'jarak' yang sudah aman
            tanggal_mentah: this.#waktuMulai,
            jarak_km: parseFloat(jarak.toFixed(2)),
            lokasi_sesi: lokasiAddressOnly,
            koordinat: koordinatObj,
            biaya_sesi: rincianBiaya.biayaPembelajaran,
            biaya_jarak: rincianBiaya.biayaTransportGuru,
            harga_total: rincianBiaya.totalPembayaran
        };
    }
}
module.exports = PemesananSesi;