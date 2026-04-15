class Portfolio {
  #guru;
  #judul;
  #deskripsi;
  #tipe;
  #bukti;
  #tanggalMulai;
  #tanggalSelesai;
  constructor(guru, judul, deskripsi, tipe, bukti, tanggalMulai, tanggalSelesai) {
    this.guru           = guru;
    this.judul          = judul;
    this._deskripsi     = deskripsi; 
    this.tipe           = tipe;
    this._bukti         = bukti;  
    this.tanggalMulai   = tanggalMulai; 
    this.tanggalSelesai = tanggalSelesai;
  }

  get deskripsi() { return this._deskripsi; }
  get bukti()     { return this._bukti;     }
}

module.exports = Portfolio;
