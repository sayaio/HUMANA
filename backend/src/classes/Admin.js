const User = require('./User');

class Admin extends User{
  constructor(adminLevel) {
    super()
    this._adminLevel = adminLevel;
  }

  #Method
  kelolaMateri() {
    // TODO: CRUD materi pembelajaran
  }
 
  kelolaHistoriSesi() {
    // TODO: ambil semua histori sesi dari repository
  }
 
  getAllUser() {
    // TODO: ambil semua user dari repository
  }

  #Getter
  get adminLevel() { return this._adminLevel; }
}

module.exports = Admin;
