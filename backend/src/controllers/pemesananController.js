const pool = require('../database'); // Pastikan path database pool Anda sudah benar

// 1. Controller untuk mengambil data dropdown
const getMateriDropdown = async (req, res) => {
    try {
        // Mengambil id_materi, nama_materi, kelas, jenjang, jurusan dari tabel materi Anda
        const [rows] = await pool.query('SELECT id_materi, nama_materi, kelas, jenjang, jurusan FROM materi');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Controller untuk menyimpan pemesanan baru
const tambahPemesanan = async (req, res) => {
    console.log("Data diterima:", req.body);
    const { 
        id_murid, 
        id_materi, 
        waktu_mulai,   
        waktu_selesai, 
        lokasi_sesi    
    } = req.body;

    if (!id_murid || !id_materi || !waktu_mulai || !waktu_selesai || !lokasi_sesi) {
        return res.status(400).json({ success: false, message: 'Harap melengkapi seluruh form pemesanan.' });
    }

    try {
        const querySQL = `
            INSERT INTO Pemesanan 
            (id_murid, id_guru, id_materi, status_pemesanan, waktu_mulai, waktu_selesai, lokasi_sesi) 
            VALUES (?, null, ?, 'menunggu konfirmasi', ?, ?, ?)
        `;

        const result = await pool.query(querySQL, [
            id_murid,         
            id_materi,     
            waktu_mulai,   
            waktu_selesai, 
            lokasi_sesi    
        ]);

        // Mengambil insertId dari baris pertama objek hasil query
        let insertedId = null;
        if (result && result[0] && result[0].insertId) {
            insertedId = result[0].insertId;
        } else if (result && result.insertId) {
            insertedId = result.insertId;
        }

        // SOLUSI UTAMA: Konversi BigInt ke String / Number agar bisa di-serialize ke JSON
        const safeId = insertedId !== null ? insertedId.toString() : null;

        res.status(201).json({ 
            success: true, 
            message: 'Pemesanan sesi berhasil disimpan!',
            id_pemesanan: safeId // Mengirimkan ID yang sudah aman berupa string
        });
        
    } catch (error) {
        console.error("Error pada saat Insert Pemesanan:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data pemesanan ke database.' });
    }
};

module.exports = {
    getMateriDropdown,
    tambahPemesanan
};