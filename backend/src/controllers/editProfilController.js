// controllers/EditProfilController.js
const pool = require('../database');

const updateBasic = async (req, res) => {
    const { email, username, phone, gender, domicile, role } = req.body;

    // ==========================================
    // === REVISI VALIDASI IMK: BACKEND GUARD ===
    // ==========================================
    if (phone && isNaN(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Gagal memperbarui: Format nomor telepon harus berupa angka murni!'
        });
    }
    // ==========================================

    try {
        let genderDb = null;
        if (gender) {
            const normalizedGender = gender.trim().toLowerCase();
            if (normalizedGender === 'laki-laki' || normalizedGender === 'l') {
                genderDb = 'L';
            } else if (normalizedGender === 'perempuan' || normalizedGender === 'p') {
                genderDb = 'P';
            }
        }

        const userRole = role ? role.toLowerCase() : 'murid';

        if (userRole === 'guru') {
            await pool.query(
                `UPDATE Guru SET username = ?, no_telepon = ?, jenis_kelamin = ?, alamat = ? WHERE email_guru = ?`,
                [username, phone, genderDb, domicile, email]
            );
        } else {
            await pool.query(
                `UPDATE Murid SET username = ?, no_telepon = ?, jenis_kelamin = ?, alamat = ? WHERE email = ?`,
                [username, phone, genderDb, domicile, email]
            );
        }

        return res.status(200).json({ success: true, message: 'Profil dasar berhasil diperbarui.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil dasar.' });
    }
};

const updateAcademic = async (req, res) => {
    const { email, major } = req.body; // major menerima string gabungan seperti "12 - IPA" atau "9 - (NULL)" atau "9"

    try {
        let kelasDb = null;
        let jurusanDb = null;

        if (major && major.includes('-')) {
            // Kasus 1: Input berupa format gabungan "Kelas - Jurusan" (cth: "12 - IPA")
            const parts = major.split('-');
            const rawKelas = parts[0].trim();
            const rawJurusan = parts[1].trim();

            kelasDb = parseInt(rawKelas, 10) || null;

            // Cek jika jurusan kosong, bertuliskan (NULL), atau tidak diisi
            if (rawJurusan && rawJurusan.toUpperCase() !== '(NULL)' && rawJurusan !== '') {
                jurusanDb = rawJurusan;
            }
        } else if (major) {
            // Kasus 2: User hanya menginput angka kelas saja (cth: "9")
            kelasDb = parseInt(major.trim(), 10) || null;
        }

        // Jalankan query ke nama kolom database yang asli: 'kelas' dan 'jurusan'
        await pool.query(
            `UPDATE Murid SET kelas = ?, jurusan = ? WHERE email = ?`,
            [kelasDb, jurusanDb, email]
        );

        return res.status(200).json({ success: true, message: 'Profil akademik berhasil diperbarui.' });
    } catch (error) {
        console.error("Error pada updateAcademic:", error);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil akademik.' });
    }
};

const updateAvailability = async (req, res) => {
    const { id_guru, is_active } = req.body;

    try {
        const statusDb = is_active ? 1 : 0;

        const dbResult = await pool.query(
            `UPDATE Guru SET is_active = ? WHERE id_guru = ?`,
            [statusDb, id_guru]
        );

        return res.status(200).json({
            success: true,
            message: `Status ketersediaan guru berhasil diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}.`
        });
    } catch (error) {
        console.error("[BACKEND] ERROR EXECUTING QUERY:", error);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui status ketersediaan.' });
    }
};

module.exports = { updateBasic, updateAcademic, updateAvailability };