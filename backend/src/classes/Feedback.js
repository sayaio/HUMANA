class Feedback {
  #idFeedback;
  #rating;
  #komentar;
  constructor(rating, komentar) {
    this._rating      = rating;        
    this._komentar    = komentar;
  }

  getRating() {
    return this.#rating
  }
 
  getKomentar() {
    return this.#komentar
  }
}

module.exports = Feedback;
