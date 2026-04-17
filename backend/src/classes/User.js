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
        this.#id_user   = id_user;
        this.#username  = username;
        this.#email     = email;
        this.#password  = password;
        this.#nama_user = nama_user;
        this.#createdAt = new Date(); 
    }

    login(inputEmail, inputPassword) {
        const emailDB = String(this.#email).trim();
        const passDB = String(this.#password).trim();
    
        const emailInput = String(inputEmail).trim();
        const passInput = String(inputPassword).trim();

        return emailDB === emailInput && passDB === passInput;
    }   

    getProfile() {
        return {
            id: this.#id_user,
            nama: this.#nama_user,
            email: this.#email
        };
    }
}

module.exports = User;