class Portfolio {
  #judul;
  #deskripsi;
  #tipe;
  #urlBukti;
  #tanggalMulai;
  #tanggalSelesai;
  constructor(judul, deskripsi, tipe, urlBukti, tanggalMulai, tanggalSelesai) {
    this.judul          = judul;
    this._deskripsi     = deskripsi; 
    this.tipe           = tipe;
    this.urlBukti         = urlBukti;  
    this.tanggalMulai   = tanggalMulai; 
    this.tanggalSelesai = tanggalSelesai;
  }

  removePortfolio(pf) {
    
  }
}

module.exports = Portfolio;
