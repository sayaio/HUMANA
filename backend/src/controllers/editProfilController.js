// controllers/EditProfilController.js
const pool = require('../database');

const updateBasic = async (req, res) => {
  const { email, username, phone, gender, domicile } = req.body; // domicile di sini adalah Alamat Lengkap

  try {
    await pool.query(
      `UPDATE murid SET username = ?, no_telepon = ?, jenis_kelamin = ?, domisili = ? WHERE email = ?`,
      [username, phone, gender, domicile, email]
    );

    return res.status(200).json({ success: true, message: 'Profil dasar berhasil diperbarui.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil dasar.' });
  }
};

const updateAcademic = async (req, res) => {
  const { email, education, major } = req.body; // education = kelas (int), major = jurusan

  try {
    await pool.query(
      `UPDATE murid SET jenjang_pendidikan = ?, kelas_jurusan = ? WHERE email = ?`,
      [education, major, email]
    );

    return res.status(200).json({ success: true, message: 'Profil akademik berhasil diperbarui.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil akademik.' });
  }
};

module.exports = { updateBasic, updateAcademic };