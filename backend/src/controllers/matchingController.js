// pemesananService.js
const pool = require('../database');

const getPermintaanBaru = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        // Query untuk mengambil pesanan dengan id_guru NULL dan status 'Mencari Pengajar'
        const query = `
            SELECT 
                p.id_pemesanan, 
                p.waktu_mulai, 
                p.waktu_selesai, 
                p.lokasi_sesi,
                m.nama_murid, 
                mat.nama_materi
            FROM pemesanan p
            JOIN murid m ON p.id_murid = m.id_murid
            JOIN materi mat ON p.id_materi = mat.id_materi
            WHERE p.id_guru IS NULL AND p.status_pemesanan = 'menunggu konfirmasi'
            ORDER BY p.waktu_mulai ASC
        `;

        const rows = await conn.query(query);

        res.json({
            success: true,
            message: "Berhasil mengambil permintaan baru",
            data: rows
        });

    } catch (err) {
        console.error("Error di matchingController:", err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { getPermintaanBaru };