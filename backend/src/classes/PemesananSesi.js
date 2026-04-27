class PemesananSesi {
  #id_pemesanan;
  #murid;
  #guru;
  #sesi;
  #materi;
  #statusPemesanan;
  #waktuPemesanan;
  #pembayaran;
  
  constructor(murid, guru, materi) {
    this.id_pemesanan = null;
    this.murid = murid;
    this.guru = guru;
    this.sesi = null;
    this.materi = materi;
    this.statusPemesanan = "menunggu_konfirmasi";
    this.waktuPesan = new Date();
    this.pembayaran = null;
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
}

module.exports = PemesananSesi;
