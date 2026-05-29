class Pembayaran {
    #idPembayaran;
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
}

module.exports = Pembayaran;
