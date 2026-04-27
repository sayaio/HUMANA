class Feedback {
  #idFeedback;
  #rating;
  #komentar;
  #murid;
  #guru;
  constructor(idFeedback, rating, komentar, lokasi, murid, guru) {
    this.id_feedback  = id_feedback;   
    this._rating      = rating;        
    this._komentar    = komentar;    
    this.lokasi       = lokasi;     String (perbaikan)
    this._murid       = murid;        
    this._guru        = guru;          
  }

  getRating() {
    return this._rating
  }
 
  getKomentar() {
    TODO: return this._komentar
  }
 
  getTimestamp() {
    // TODO: return this.createdAt
  }
}

module.exports = Feedback;
