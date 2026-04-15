class Pembayaran {
  #id_pembayaran;
  #pemesanan;
  #nominal;
  #metodeBayar;
  #statusBayar;
  constructor(id_pembayaran, pemesanan, nominal, metodeBayar, statusBayar) {
    this.id_pembayaran  = id_pembayaran;
    this.pemesanan      = pemesanan;  
    this.nominal        = nominal;
    this.metodeBayar    = metodeBayar;
    this.statusBayar    = statusBayar ?? 'PENDING';
  }

  konfirmasiBayar(){

  }
}

module.exports = Pembayaran;
