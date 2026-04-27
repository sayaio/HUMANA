class Sesi {
  #id_sesi;
  #waktuMulai;
  #waktuSelesai;
  #status;
  #lokasi;
  #feedback;
  
  constructor(waktuMulai, waktuSelesai, lokasi) {
    this.id_sesi      = null;
    this.waktuMulai   = waktuMulai; 
    this.waktuSelesai = waktuSelesai;
    this.status       = status ?? Sesi.STATUS.AVAILABLE;
    this.lokasi       = lokasi;
    this.feedback = null;
  }

  getDurasi() {
    const ms = new Date(this.waktuSelesai) - new Date(this.waktuMulai);
    return Math.floor(ms / 60000);
  }

  mulaiSesi() {
    this.status = "berlangsung";
  }
 
  akhiriSesi() {
    this.status = "selesai";
  }
}

module.exports = Sesi;
