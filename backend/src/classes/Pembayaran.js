class Pembayaran {
  constructor(id_pembayaran, pemesanan, nominal, metodeBayar, statusBayar) {
    this.id_pembayaran  = id_pembayaran;
    this.pemesanan      = pemesanan;  
    this.nominal        = nominal;
    this.metodeBayar    = metodeBayar;
    this.statusBayar    = statusBayar ?? 'PENDING';
  }

  #Method
  konfirmasiBayar(){
    
  }
}

module.exports = Pembayaran;
