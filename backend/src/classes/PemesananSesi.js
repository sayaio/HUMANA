class PemesananSesi {
  constructor(id_pemesanan, murid, guru, sesi, materi, statusPemesanan, pembayaran) {
    this.id_pemesanan     = id_pemesanan;
    this.murid            = murid;
    this.guru             = guru;
    this.sesi             = sesi;
    this.materi           = materi;
    this.statusPemesanan  = statusPemesanan ?? PemesananSesi.STATUS.PENDING;
    this.waktuPemesanan   = new Date(); 
    this.pembayaran       = pembayaran ?? null;
  }

  #Method
  getStatus() {
    // TODO: return this.statusPemesanan
  }
 
  getPembayaran() {
    // TODO: return this.pembayaran
  }
 
  getInvoice() {
    // TODO: generate atau return invoice number
  }
}

module.exports = PemesananSesi;
