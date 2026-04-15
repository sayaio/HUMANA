class Sesi {
  constructor(id_sesi, tanggalSesi, waktuMulai, waktuSelesai, status, lokasi) {
    this.id_sesi      = id_sesi;
    this.tanggalSesi  = tanggalSesi; 
    this.waktuMulai   = waktuMulai; 
    this.waktuSelesai = waktuSelesai;
    this.status       = status ?? Sesi.STATUS.AVAILABLE;
    this.lokasi       = lokasi;
  }

  #Getter
  getDurasi() {
    // TODO: hitung selisih waktuMulai dan waktuSelesai dalam menit
  }
}

module.exports = Sesi;
