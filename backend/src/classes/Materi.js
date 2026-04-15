class Materi {
  #id_materi;
  #namaMateri;
  #kelas;
  #deskripsiMateri;
  constructor(id_materi, namaMateri, kelas, deskripsiMateri) {
    this.id_materi       = id_materi;
    this.namaMateri      = namaMateri;
    this.kelas           = kelas;
    this._deskripsiMateri = deskripsiMateri;
  }

  #Method
  getNamaMateri() {
    // TODO: return this.namaMateri
  }
 
  getDeskripsi() {
    // TODO: return this._deskripsiMateri
  }

  get deskripsiMateri() { return this._deskripsiMateri; }
}

module.exports = Materi;
