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
        this.#namaUser = nama_user;
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
        console.log(`${this.#namaUser} telah keluar dari sistem.`);
    }
    // Cara panggil: User.editProfile({ username: "dani_baru" })`
    editProfile(dataUpdate) {
        this.#username  = dataUpdate.username  ?? this.#username;
        this.#email     = dataUpdate.email     ?? this.#email;
        this.#password  = dataUpdate.password  ?? this.#password;
        this.#namaUser = dataUpdate.nama_user ?? this.#namaUser;
    }
    getProfile() {
        return {
            id: this.#idUser,
            username: this.#username,
            nama: this.#namaUser,
            email: this.#email,
            createdAt: this.#createdAt
        };
    }
    getRole() {
        throw new Error("Method 'getRole()' must be implemented by subclass.");
    }
}

module.exports = User;