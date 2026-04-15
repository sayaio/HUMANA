class User {
    #id_user;
    #username;
    #role;
    #email;
    #password;
    #nama_user;
    #createdAt;
    constructor(id_user, username, role, email, password, nama_user) {
        this.#id_user = id_user;
        this.#username = username;
        this.#role = role;
        this.#email = email;
        this.#password = password;
        this.#nama_user = nama_user;
        this.#createdAt = new Date();
    }
    login(){
        return    
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
