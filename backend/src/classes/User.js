class User {
    #idUser;
    #username;
    #email;
    #password;
    #namaUser;
    #createdAt;

    constructor(username, email, password, nama_user, id = null) {
        this.#username = username;
        this.#email = email;
        this.#password = password;
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
    logout() {
        console.log(`${this.#nama_user} telah keluar dari sistem.`);
    }
    // Cara panggil: User.editProfile({ username: "dani_baru" })`
    editProfile(dataUpdate) {
        this.#username  = dataUpdate.username  ?? this.#username;
        this.#email     = dataUpdate.email     ?? this.#email;
        this.#password  = dataUpdate.password  ?? this.#password;
        this.#nama_user = dataUpdate.nama_user ?? this.#nama_user;
    }
    getProfile() {
        return {
            id: this.#id_user,
            username: this.#username,
            nama: this.#nama_user,
            email: this.#email,
            createdAt: this.#createdAt
        };
    }
    getRole() {
        throw new Error("Method 'getRole()' must be implemented by subclass.");
    }
}

module.exports = User;