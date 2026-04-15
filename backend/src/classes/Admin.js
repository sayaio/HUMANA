const User = require('./User');

class Admin extends User{
  #AdminLevel;
  constructor(adminLevel) {
    super()
    this._adminLevel = adminLevel;
  }

  kelolaMateri() {
    // TODO: CRUD materi pembelajaran
  }
 
  kelolaHistoriSesi() {
    // TODO: ambil semua histori sesi dari repository
  }
 
  getAllUser() {
    // TODO: ambil semua user dari repository
  }

  get adminLevel() { return this._adminLevel; }
}

module.exports = Admin;
