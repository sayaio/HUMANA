const { fetchQuery, executeQuery } = require('../utils/dbHelper');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const register = async (req, res) => {
    const { namaLengkap, role, email, password, username = null } = req.body;
    try {

        const checkQuery = `
        SELECT email_guru as email FROM Guru WHERE email_guru = ?
        UNION
        SELECT email FROM Murid WHERE email = ?
    `;

        // HAPUS kurung siku di sini
        const existingUser = await fetchQuery(checkQuery, [email, email]);

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar!"
            });
        }

        let newUserInstance;

        if (role === 'Guru') {
            const queryGuru = `INSERT INTO Guru (nama_guru, email_guru, password, username, is_active) VALUES (?, ?, ?, ?, 0)`;
            const result = await executeQuery(queryGuru, [namaLengkap, email, password, namaLengkap]); // SEMENTARA USERNAME KARENA BLM ADA INPUTAN JADINYA ISI NAMALENGKAP DULU

            const insertedId = Number(result?.insertId || 0); // Pastikan jadi number
            newUserInstance = new Guru(username, email, password, namaLengkap, insertedId, 0);

        } else if (role === 'Murid') {
            const queryMurid = `INSERT INTO Murid (nama_murid, email, password, username) VALUES (?, ?, ?, ?)`;
            const result = await executeQuery(queryMurid, [namaLengkap, email, password, namaLengkap]); // SEMENTARA USERNAME KARENA BLM ADA INPUTAN JADINYA ISI NAMALENGKAP DULU

            const insertedId = Number(result?.insertId || 0);
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
    }
};

module.exports = { register };