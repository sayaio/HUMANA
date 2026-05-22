// pemesananService.js
const pool = require('../database');

const getPermintaanBaru = async (req, res) => {
    let conn;
    try {
        // 1. Tangkap id_guru dari parameter query yang dikirim frontend
        const idGuru = req.query.id_guru;

        // Validasi
        if (!idGuru) {
            return res.status(400).json({
                success: false,
                message: "id_guru wajib dikirim!"
            });
        }

        conn = await pool.getConnection();

        // 2. Tambahkan p.harga_total di dalam SELECT
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
            WHERE p.id_guru IS NULL 
              AND p.status_pemesanan = 'menunggu konfirmasi'
            ORDER BY p.waktu_mulai ASC
        `;

        const rows = await conn.query(query);

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil permintaan baru",
            data: rows
        });

    } catch (err) {
        console.error("Error di getPermintaanBaru:", err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: err.message
        });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { getPermintaanBaru };