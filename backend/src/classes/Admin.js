const User = require('./User');

class Admin extends User{
  #adminLevel;
  constructor(idUser, username, email, password, namaUser, adminLevel) {
    super(idUser, username, email, password, namaUser)
    this._adminLevel = adminLevel;
  }

  tambahMateri(){
    
  }

  get adminLevel() { return this._adminLevel; }
}

module.exports = Admin;
