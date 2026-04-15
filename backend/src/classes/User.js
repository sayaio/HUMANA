class User {
    #id_user;
    #username;
    #role;
    #email;
    #password;
    #nama_user;
    #createdAt;
    constructor(id_user, username, email, password, nama_user) {
        if (new.target === User) {
            throw new Error('User adalah abstract class dan tidak dapat diinstansiasi langsung');
        }
        this._id_user   = id_user;
        this._username  = username;
        this.email      = email;
        this._password  = password;
        this.nama_user  = nama_user;
        this.createdAt  = new Date(); 
    }
    login(inputEmail, inputPassword){
        if (this.#email === inputEmail && this.#password === inputPassword) {
            return true;
        }
        return false;
    }
    logout(){

    }
    editProfile(){

    }
    getProfile(){
        return
    }
    getRole(){
        return
    }
    receiveNotification(){
        
    }
}

module.exports = User;
