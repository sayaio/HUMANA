class Availability {
    // 1. Deklarasi (Harus ada di sini)
    #id_availability; 
    #waktuMulai;
    #waktuSelesai;

    constructor(waktuMulai, waktuSelesai) {
        // Gunakan nama yang sama dengan deklarasi di atas
        this.#id_availability = Date.now(); 
        this.#waktuMulai = new Date(waktuMulai);
        this.#waktuSelesai = new Date(waktuSelesai);
    }

    isAvailable(waktuPesan) {
        return waktuPesan < this.#waktuSelesai && waktuPesan > this.#waktuMulai;
    }

    // 2. Getter (Pastikan nama setelah tanda # sama dengan deklarasi)
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