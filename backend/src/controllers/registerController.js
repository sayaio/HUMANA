const pool = require('../database');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const register = async (req, res) => {
    const { namaLengkap, email, password, role } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        // 1. CEK APAKAH EMAIL SUDAH DIGUNAKAN (Cek di kedua tabel)
        const checkQuery = `
            SELECT email_guru FROM guru WHERE email_guru = ?
            UNION
            SELECT email FROM murid WHERE email = ?
        `;
        const existingUser = await conn.query(checkQuery, [email, email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Email sudah terdaftar!" 
            });
        }

        // 2. PROSES INSERT BERDASARKAN ROLE
        if (role === 'Guru') {
            const queryGuru = `INSERT INTO guru (nama_guru, email_guru, password) VALUES (?, ?, ?)`;
            await conn.query(queryGuru, [namaLengkap, email, password]);
            
            const baru = new Guru(null, email, email, password, namaLengkap);
            
        } else if (role === 'Murid') {
            const queryMurid = `INSERT INTO murid (nama_murid, email, password) VALUES (?, ?, ?)`;
            await conn.query(queryMurid, [namaLengkap, email, password]);
            
            const baru = new Murid(null, email, email, password, namaLengkap);
        } else {
            return res.status(400).json({ success: false, message: "Role tidak valid!" });
        }

        // 3. RESPONSE SUKSES
        res.status(201).json({
            success: true,
            message: "Registrasi berhasil"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal menyimpan data ke database" });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { register };