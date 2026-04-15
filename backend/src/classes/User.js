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
        // Inisialisasi menggunakan variabel private (#) yang benar
        this.#id_user   = id_user;
        this.#username  = username;
        this.#email     = email;
        this.#password  = password;
        this.#nama_user = nama_user;
        this.#createdAt = new Date(); 
    }

    login(inputEmail, inputPassword) {
    // Gunakan .trim() untuk membuang spasi di depan/belakang jika ada
        const emailDB = String(this.#email).trim();
        const passDB = String(this.#password).trim();
    
        const emailInput = String(inputEmail).trim();
        const passInput = String(inputPassword).trim();

        console.log(`DEBUG DALAM CLASS:`);
        console.log(`DB Email: "${this.#email}" | Input: "${inputEmail}"`);
        console.log(`DB Pass : "${this.#password}" | Input: "${inputPassword}"`);
        return emailDB === emailInput && passDB === passInput;
    }   

    getProfile() {
        return {
            id: this.#id_user,
            nama: this.#nama_user,
            email: this.#email
        };
    }
    
    // ... method lainnya biarkan kosong tidak apa-apa
}

module.exports = User;