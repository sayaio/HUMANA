class Portfolio {
  #judul;
  #deskripsi;
  #tipe;
  #urlBukti;
  #tanggalMulai;
  #tanggalSelesai;
  #idGuru;

  constructor(idGuru, judul, deskripsi, tipe, urlBukti, tanggalMulai, tanggalSelesai) {
    this.#idGuru        = idGuru;
    this.#judul         = judul;
    this.#deskripsi     = deskripsi;
    this.#tipe          = tipe;
    this.#urlBukti      = urlBukti;
    this.#tanggalMulai  = tanggalMulai;
    this.#tanggalSelesai = tanggalSelesai;
  }

  // Getters
  get idGuru()         { return this.#idGuru; }
  get judul()          { return this.#judul; }
  get deskripsi()      { return this.#deskripsi; }
  get tipe()           { return this.#tipe; }
  get urlBukti()       { return this.#urlBukti; }
  get tanggalMulai()   { return this.#tanggalMulai; }
  get tanggalSelesai() { return this.#tanggalSelesai; }

  // Konversi ke object plain untuk dikirim ke DB
  toJSON() {
    return {
      id_guru:          this.#idGuru,
      judul:            this.#judul,
      deskripsi:        this.#deskripsi,
      tipe_portfolio:   this.#tipe,
      bukti:            this.#urlBukti,
      tanggal_mulai:    this.#tanggalMulai,
      tanggal_selesai:  this.#tanggalSelesai,
    };
  }
}

module.exports = Portfolio;