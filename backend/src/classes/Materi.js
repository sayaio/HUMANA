class Materi {
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
 
  /** @returns {string} */
  getDeskripsi() {
    // TODO: return this._deskripsiMateri
  }

  #Getter
  get deskripsiMateri() { return this._deskripsiMateri; }
}

module.exports = Materi;
