const { fetchQuery, executeQuery } = require('../utils/dbHelper');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');

const login = async (req, res) => {
    const { email, password } = req.body; // 'email' field bisa berisi email atau username
    try {
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
        const rows = await fetchQuery(query, [email, email, email, email]);

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
    }
};
const checkEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const query = `
      SELECT email_guru AS email FROM Guru WHERE email_guru = ?
      UNION
      SELECT email FROM Murid WHERE email = ?
    `;
    const rows = await fetchQuery(query, [email, email]);
    if (rows.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const loginGoogle = async (req, res) => {
  const { email } = req.body;
  try {
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
        NULL AS is_active,
        kelas,
        jurusan
      FROM Murid WHERE email = ?
    `;
    const rows = await fetchQuery(query, [email, email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
      });
    }

    const dataDB = rows[0];
    let userAktif;

    if (dataDB.role === 'Guru') {
      const statusToggleBoolean = dataDB.is_active == 1;
      userAktif = new Guru(
        dataDB.username, dataDB.email, dataDB.password,
        dataDB.nama_lengkap, dataDB.id, statusToggleBoolean,
        dataDB.no_telepon, dataDB.jenis_kelamin, dataDB.alamat
      );
    } else {
      userAktif = new Murid(
        dataDB.username, dataDB.email, dataDB.password,
        dataDB.nama_lengkap, dataDB.id, dataDB.kelas,
        dataDB.no_telepon, dataDB.jenis_kelamin, dataDB.alamat, dataDB.jurusan
      );
    }

    res.json({ success: true, profile: userAktif.getProfile() });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { login, loginGoogle, checkEmail };

