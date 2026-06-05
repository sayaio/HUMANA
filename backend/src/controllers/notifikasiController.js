const pool = require('../database');

// Ambil semua notifikasi milik seorang user (guru/murid).
const getNotifikasi = async (req, res) => {
    const { role, id } = req.params;
    const userRole = role.toLowerCase();

    if (userRole !== 'murid' && userRole !== 'guru') {
        return res.status(400).json({ success: false, message: 'Role harus murid atau guru.' });
    }

    const kolom = userRole === 'guru' ? 'id_guru' : 'id_murid';

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const rows = await pool.query(
            `SELECT id_notifikasi, judul, pesan FROM Notifikasi WHERE ${kolom} = ? ORDER BY id_notifikasi DESC LIMIT ? OFFSET ?`,
            [id, limit, offset]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[notifikasiController] getNotifikasi error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotifikasi };
