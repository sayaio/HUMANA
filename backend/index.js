const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

// 1. Import Class User yang sudah kamu buat
const Guru = require('./src/classes/Guru');
const Murid = require('./src/classes/Murid');

const app = express();
app.use(cors());
app.use(express.json()); // Agar bisa membaca data JSON dari React Native

// 2. Konfigurasi Database MariaDB
const pool = mariadb.createPool({
    host: 'localhost', 
    user: 'root',      // Sesuaikan jika kamu pakai password di user root MariaDB
    password: 'fathanganteng',      // Kosongkan jika XAMPP default, isi jika ada password
    database: 'humana' // Sesuaikan dengan nama databasemu
});

// 3. Endpoint API Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    let conn;

    console.log("\n=== MULAI PROSES LOGIN ===");
    console.log("1. Data dari React Native -> Email:", email, "| Password:", password);
    try {
        conn = await pool.getConnection();

        const query = `
    SELECT 
        id_guru AS id, 
        nama_guru AS nama_lengkap, 
        email_guru AS email, 
        password, 
        'Guru' AS role 
    FROM guru WHERE email_guru = ?

    UNION ALL

    SELECT 
        id_murid AS id, 
        nama_murid AS nama_lengkap, 
        email, 
        password, 
        'Murid' AS role 
    FROM murid WHERE email = ?
        `;

        const rows = await conn.query(query, [email, email]);

        if (rows.length > 0) {
            const dataDB = rows[0];
            console.log("3. Akun ditemukan! Data dari DB:", dataDB);
            // Di sinilah OOP kita beraksi! 
            // Kita gunakan dataDB.role untuk menentukan class mana yang di-instansiasi
            let userAktif;
            
            if (dataDB.role === 'Guru') {
                userAktif = new Guru(dataDB.id, dataDB.nama_lengkap, dataDB.email, dataDB.password, dataDB.nama_lengkap);
            } else if (dataDB.role === 'Murid') {
                userAktif = new Murid(dataDB.id, dataDB.nama_lengkap, dataDB.email, dataDB.password, dataDB.nama_lengkap);
            } //else {
            //     userAktif = new Admin(dataDB.id, dataDB.nama_lengkap, dataDB.role, dataDB.email, dataDB.password);
            // }
            console.log("4. Pengecekan Method Login OOP:");
            console.log("   - Password di DB      : '" + dataDB.password + "'");
            console.log("   - Password dari Input : '" + password + "'");

            const isLoginValid = userAktif.login(email, password);
            console.log("5. Hasil method userAktif.login() :", isLoginValid);
            // Validasi password menggunakan method yang sudah kamu buat di class User
            if (isLoginValid) {
                console.log("6. STATUS: SUKSES LOGIN!");
                res.json({
                    success: true,
                    message: `Login Berhasil sebagai ${dataDB.role}`,
                    profile: userAktif.getProfile()
                });
            } else {
                console.log("6. STATUS: GAGAL! Password Salah.");
                res.status(401).json({ success: false, message: "Password salah!" });
            }
        } else {
            console.log("3. STATUS: GAGAL! Array kosong, email tidak ada di MariaDB.");
            res.status(404).json({ success: false, message: "Akun tidak terdaftar!" });
        }
    } catch (err) {
        console.log("!!! ERROR FATAL SERVER !!!", err.message);
        res.status(500).json({ success: false, error: err.message });
        console.log("ERROR SERVER:", err.message); 
        // Hapus console.log(dataDB) di sini
    } finally {
        if (conn) conn.release();
        console.log("=== SELESAI ===\n");
    }
});

// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Backend Humana berjalan di http://localhost:${PORT}`);
});