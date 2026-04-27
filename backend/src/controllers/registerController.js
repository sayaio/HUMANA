const pool = require('../database');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const register = async (req, res) => {
    const { namaLengkap, email, password, role, username = null } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

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

        let newUserInstace;

        if (role === 'Guru') {
            const queryGuru = `INSERT INTO guru (nama_guru, email_guru, password, username) VALUES (?, ?, ?, ?)`;
            const result = await conn.query(queryGuru, [namaLengkap, email, password, username]);
            
            const insertedId = result.insertedId;
            newUserInstance = new Guru(username, email, password, namaLengkap, insertedId);

        } else if (role === 'Murid') {
            const queryMurid = `INSERT INTO murid (nama_murid, email, password, username) VALUES (?, ?, ?, ?)`;
            const result = await conn.query(queryMurid, [namaLengkap, email, password]);
            
            const insertedId = result.insertId;
            newUserInstance = new Murid(username, email, password, namaLengkap, insertedId);
        } else {
            return res.status(400).json({ success: false, message: "Role tidak valid!" });
        }

        res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: newUserInstance.getProfile()
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal menyimpan data ke database" });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { register };