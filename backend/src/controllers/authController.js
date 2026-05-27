const pool = require('../database');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const login = async (req, res) => {
    const { email, password } = req.body; // 'email' field bisa berisi email atau username
    let conn;

    try {
        conn = await pool.getConnection();
        const query = `
        SELECT
            id_guru AS id, 
            nama_guru AS nama_lengkap, 
            email_guru AS email, 
            password, 
            'Guru' AS role,
            username,
            no_telepon,
            jenis_kelamin,
            alamat,
            is_active,
            NULL AS kelas,
            NULL AS jurusan
        FROM Guru WHERE email_guru = ? OR username = ?

        UNION ALL

        SELECT 
            id_murid AS id, 
            nama_murid AS nama_lengkap, 
            email, 
            password, 
            'Murid' AS role,
            username,       
            no_telepon,
            jenis_kelamin,
            alamat,
            NULL AS is_active,   -- ← Diisi NULL sebagai penyeimbang struktur UNION tabel Murid
            kelas,
            jurusan
        FROM Murid WHERE email = ? OR username = ?
        `;

        // Eksekusi kueri dengan 4 parameter pengikat (binding parameters)
        const rows = await conn.query(query, [email, email, email, email]);

        if (rows.length > 0) {
            const dataDB = rows[0];
            let userAktif;

            if (dataDB.role === 'Guru') {
                // Konversi tinyint (0/1) dari DB menjadi Boolean murni (false/true)
                const statusToggleBoolean = dataDB.is_active == 1;
                console.log(statusToggleBoolean);
                // Menyesuaikan dengan parameter constructor Guru:
                // constructor(username, email, password, nama_user, id, isActive)
                userAktif = new Guru(
                    dataDB.username,
                    dataDB.email,
                    dataDB.password,
                    dataDB.nama_lengkap,
                    dataDB.id,
                    statusToggleBoolean,
                    dataDB.no_telepon,   
                    dataDB.jenis_kelamin,  
                    dataDB.alamat        
                );
                console.log("Objek Guru Berhasil Dibuat:", userAktif.getProfile());
            } else if (dataDB.role === 'Murid') {
                userAktif = new Murid(
                    dataDB.username,
                    dataDB.email,
                    dataDB.password,
                    dataDB.nama_lengkap,
                    dataDB.id,
                    dataDB.kelas,
                    dataDB.no_telepon,
                    dataDB.jenis_kelamin,
                    dataDB.alamat,
                    dataDB.jurusan
                );
            }

            // Validasi kecocokan password teks biasa (Plain Text)
            const isLoginValid = password === dataDB.password;

            if (isLoginValid) {
                res.json({
                    success: true,
                    profile: userAktif.getProfile()
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: "Password salah!"
                });
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