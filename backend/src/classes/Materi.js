class Materi {
  #idMateri;
  #namaMateri;
  #kelas;
  #deskripsiMateri;
  constructor(idMateri, namaMateri, kelas, deskripsiMateri) {
    this.#idMateri = null;
    this.#namaMateri = namaMateri;
    this.#kelas = kelas;
    this.#deskripsiMateri = deskripsiMateri;
    }
  getNamaMateri() {
    return this.#namaMateri;
  }

  getDeskripsi() {
    return this.#deskripsiMateri;
  }

  setDeskripsi(deskripsiMateri) {
    this.#deskripsiMateri = deskripsiMateri;
  }

  getId() {
    return this.#idMateri;
  }

  getKelas() {
    return this.#kelas;
  }

  get deskripsiMateri() { return this.#deskripsiMateri; }
}

module.exports = Materi;
