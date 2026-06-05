const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const pool = mariadb.createPool({
    // 1. Ubah host dengan Host URL dari dasbor Aiven Anda
    host: 'mysql-22e5161d-humana-dev.f.aivencloud.com',

    // 2. Ubah port sesuai port unik dari Aiven (bukan 3306 lagi)
    port: 13702,

    // 3. User bawaan Aiven
    user: 'avnadmin',

    // 4. Masukkan password Aiven Anda (yang sebelumnya Anda salin ke HeidiSQL)
    password: process.env.DB_PASSWORD,

    // 5. Ubah sesuai nama database yang Anda buat (pake backticks jika namanya 'humana-dev')
    database: 'humana-dev',

    // 6. WAJIB: Konfigurasi SSL untuk keamanan Aiven.
    //    - Di server (Render): baca dari environment variable AIVEN_CA_CERT.
    //    - Di lokal: baca dari file ca.pem.
    ssl: {
        ca: process.env.AIVEN_CA_CERT
            ? process.env.AIVEN_CA_CERT
            : fs.readFileSync(path.join(__dirname, '../../ca.pem'))
    },

    // Opsional: Rekomendasi tambahan agar pool koneksi tim lebih stabil
    connectionLimit: 5
});

module.exports = pool;

/*
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'humanaprotot', 
    database: 'humana',    
});

module.exports = pool;
*/