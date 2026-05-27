class Feedback {
    #idFeedback;
    #rating;
    #komentar;

    constructor(rating, komentar) {
        this.#rating = rating ? Number(rating) : 0;
        this.#komentar = komentar;
    }

    getRating() {
        return this.#rating;
    }

    getKomentar() {
        return this.#komentar;
    }
}

module.exports = Feedback;