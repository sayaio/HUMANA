class Pembayaran {
    #idPembayaran;
<<<<<<< HEAD
    #nominal;
    #metodeBayar;
    #statusBayar;
    #tanggalBayar;

    // Beri opsi statusBayar default 'PENDING' jika tidak diset dari DB
    constructor(nominal, metodeBayar, id = null, status = 'menunggu', tanggal = new Date()) {
        this.#idPembayaran = id;
        this.#nominal = nominal;
        this.#metodeBayar = metodeBayar;
        this.#statusBayar = status;
        this.#tanggalBayar = tanggal;
    }

    isBayar() {
        return this.#statusBayar === 'menunggu';
    }

    konfirmasiBayar() {
        if (this.#statusBayar === 'menunggu') {
            this.#statusBayar = 'lunas';
            return true;
        }
        return false;
    }

    getNominal() {
        return this.#nominal;
    }

    getMetodeBayar() {
        return this.#metodeBayar;
    }

    getStatusBayar() {
        return this.#statusBayar;
    }

    getTanggalBayar() {
        return this.#tanggalBayar;
    }

    getId() {
        return this.#idPembayaran;
    }

    toJSON() {
        return {
            idPembayaran: this.getId(),
            nominal: this.getNominal(),
            metodeBayar: this.getMetodeBayar(),
            statusBayar: this.getStatusBayar(),
            tanggalBayar: this.getTanggalBayar()
        };
    }
=======
    #idPemesanan;
    #biayaSesi;
    #biayaJarak;
    #nominal; // Ini total pembayaran
    #metodeBayar;
    #statusBayar;
    #tanggalBayar;
    constructor(idPemesanan, biayaSesi, biayaJarak, nominal, metodeBayar = 'menunggu') {
        this.#idPembayaran = null;
        this.#idPemesanan = idPemesanan;
        this.#biayaSesi = biayaSesi;
        this.#biayaJarak = biayaJarak;
        this.#nominal = nominal;
        this.#metodeBayar = metodeBayar;
        this.#statusBayar = 'menunggu';
        this.#tanggalBayar = null; // null karena belum dibayar
    }
    isBayar() {
        return this.#statusBayar === 'lunas'; // Menyesuaikan enum/string di DB
    }
    konfirmasiBayar(metodeTerpilih) {
        if (this.#statusBayar === 'menunggu') {
            this.#statusBayar = 'lunas';
            this.#metodeBayar = metodeTerpilih;
            this.#tanggalBayar = new Date();
            return true;
        }
        return false;
    }
    // Getters
    getId() { return this.#idPembayaran; }
    getIdPemesanan() { return this.#idPemesanan; }
    getBiayaSesi() { return this.#biayaSesi; }
    getBiayaJarak() { return this.#biayaJarak; }
    getNominal() { return this.#nominal; }
    getMetodeBayar() { return this.#metodeBayar; }
    getStatusBayar() { return this.#statusBayar; }
    getTanggalBayar() { return this.#tanggalBayar; }
    // Setters khusus jika data di-fetch dari DB
    setId(id) { this.#idPembayaran = id; }
    setStatusBayar(status) { this.#statusBayar = status; }
    setTanggalBayar(tanggal) { this.#tanggalBayar = tanggal; }
    // Helper untuk dikirim ke Frontend/JSON
    toJSON() {
        return {
            id_pembayaran: this.#idPembayaran,
            id_pemesanan: this.#idPemesanan,
            biaya_sesi: this.#biayaSesi,
            biaya_jarak: this.#biayaJarak,
            nominal: this.#nominal,
            metode_pembayaran: this.#metodeBayar,
            status_pembayaran: this.#statusBayar,
            tanggal_pembayaran: this.#tanggalBayar
        };
    }
>>>>>>> fixpembayaranpage
}
module.exports = Pembayaran;