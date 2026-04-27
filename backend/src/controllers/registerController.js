const pool = require('../database');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const register = async (req, res) => {
    const { namaLengkap, role, email, password, username = null } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        const checkQuery = `
        SELECT email_guru as email FROM guru WHERE email_guru = ?
        UNION
        SELECT email FROM murid WHERE email = ?
    `;

        // HAPUS kurung siku di sini
        const existingUser = await conn.query(checkQuery, [email, email]);

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar!"
            });
        }

        let newUserInstance;

        if (role === 'Guru') {
            const queryGuru = `INSERT INTO guru (nama_guru, email_guru, password, username) VALUES (?, ?, ?, ?)`;
            // HAPUS kurung siku di sini juga
            const result = await conn.query(queryGuru, [namaLengkap, email, password, namaLengkap]); // SEMENTARA USERNAME KARENA BLM ADA INPUTAN JADINYA ISI NAMALENGKAP DULU

            const insertedId = Number(result.insertId); // Pastikan jadi number
            newUserInstance = new Guru(username, email, password, namaLengkap, insertedId);

        } else if (role === 'Murid') {
            const queryMurid = `INSERT INTO murid (nama_murid, email, password, username) VALUES (?, ?, ?, ?)`;
            const result = await conn.query(queryMurid, [namaLengkap, email, password, namaLengkap]); // SEMENTARA USERNAME KARENA BLM ADA INPUTAN JADINYA ISI NAMALENGKAP DULU

            const insertedId = Number(result.insertId);
            newUserInstance = new Murid(username, email, password, namaLengkap, insertedId);
        }

        res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: newUserInstance.getProfile()
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ success: false, message: "Gagal menyimpan data ke database" });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { register };