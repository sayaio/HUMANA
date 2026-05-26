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
            NULL AS username, 
            no_telepon,
            jenis_kelamin,
            alamat,
            NULL AS kelas,
            NULL AS jurusan
        FROM Guru WHERE email_guru = ?

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
            kelas,
            jurusan
        FROM Murid WHERE email = ? OR username = ?
        `;

        // Guru hanya bisa login via email, Murid bisa email atau username
        const rows = await conn.query(query, [email, email, email]);

        if (rows.length > 0) {
            const dataDB = rows[0];
            let userAktif;

            if (dataDB.role === 'Guru') {
                userAktif = new Guru(dataDB.nama_lengkap, dataDB.email, dataDB.password, dataDB.nama_user, dataDB.id);
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

            // Cek password langsung — bandingkan input dengan hash/plain di DB
            // Login input bisa berupa email atau username, jadi kita bypass cek identifier
            // dan hanya validasi password
            const isLoginValid = password === dataDB.password;
            // Kalau pakai bcrypt: const isLoginValid = await bcrypt.compare(password, dataDB.password);

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