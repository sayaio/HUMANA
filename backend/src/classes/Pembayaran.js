class Pembayaran {
  #idPembayaran;
  #nominal;
  #metodeBayar;
  #statusBayar;
  #tanggalBayar;

  constructor(nominal, metodeBayar) {
    this.#idPembayaran = null;
    this.#nominal = nominal;
    this.#metodeBayar = metodeBayar;
    this.#statusBayar = 'PENDING';
    this.#tanggalBayar = new Date();
  }

  isBayar() {
    return this.#statusBayar === 'PAID';
  }

  konfirmasiBayar() {
    if (this.#statusBayar === 'PENDING') {
      this.#statusBayar = 'PAID';
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
}

module.exports = Pembayaran;
