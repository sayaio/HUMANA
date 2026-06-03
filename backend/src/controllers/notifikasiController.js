const pool = require('../database');

// Ambil semua notifikasi milik seorang user (guru/murid).
const getNotifikasi = async (req, res) => {
    const { role, id } = req.params;
    const userRole = role.toLowerCase();

    if (userRole !== 'murid' && userRole !== 'guru') {
        return res.status(400).json({ success: false, message: 'Role harus murid atau guru.' });
    }

    const kolom = userRole === 'guru' ? 'id_guru' : 'id_murid';

    try {
        const rows = await pool.query(
            `SELECT id_notifikasi, judul, pesan FROM Notifikasi WHERE ${kolom} = ? ORDER BY id_notifikasi DESC`,
            [id]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[notifikasiController] getNotifikasi error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Hapus semua notifikasi milik seorang user (dipanggil setelah popup ditampilkan).
const hapusNotifikasiUser = async (req, res) => {
    const { role, id } = req.params;
    const userRole = role.toLowerCase();

    if (userRole !== 'murid' && userRole !== 'guru') {
        return res.status(400).json({ success: false, message: 'Role harus murid atau guru.' });
    }

    const kolom = userRole === 'guru' ? 'id_guru' : 'id_murid';

    try {
        await pool.query(`DELETE FROM Notifikasi WHERE ${kolom} = ?`, [id]);
        return res.status(200).json({ success: true, message: 'Notifikasi dibersihkan.' });
    } catch (error) {
        console.error('[notifikasiController] hapusNotifikasiUser error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotifikasi, hapusNotifikasiUser };
