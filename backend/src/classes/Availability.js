class Availability {
    #idAvailability;
    #waktuMulai;
    #waktuSelesai;
    constructor(waktuMulai, waktuSelesai) {
        this.#waktuMulai = new Date(waktuMulai);
        this.#waktuSelesai = new Date(waktuSelesai);
    }
    isAvailable(waktuPesan) {
        return waktuPesan < this.#waktuSelesai && waktuPesan > this.#waktuMulai;
    }
    get idAvailability() {
        return this.#id_availability;
    }
    get waktuMulai() {
        return this.#waktuMulai;
    }
    get waktuSelesai() {
        return this.#waktuSelesai;
    }
}

module.exports = Availability;