const pool = require('../database');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const login = async (req, res) => {
    const { email, password } = req.body;
    let conn;

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
            let userAktif;
            
            if (dataDB.role === 'Guru') {
                userAktif = new Guru(dataDB.id, dataDB.nama_lengkap, dataDB.email, dataDB.password, dataDB.nama_lengkap);
            } else if (dataDB.role === 'Murid') {
                userAktif = new Murid(dataDB.id, dataDB.nama_lengkap, dataDB.email, dataDB.password, dataDB.nama_lengkap);
            }

            const isLoginValid = userAktif.login(email, password);
            
            if (isLoginValid) {
                res.json({
                    success: true,
                    profile: userAktif.getProfile()
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: "Password salah!" });
            }
        } else {
            res.status(404).json({ success: false, message: "Akun tidak terdaftar!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { login };