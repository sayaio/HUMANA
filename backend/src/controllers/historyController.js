const pool = require('../database');

const getHistory = async (req, res) => {
    const { id, role } = req.params;
    let conn;

    try {
        conn = await pool.getConnection();

        const query = `
            SELECT
                p.id_pemesanan,
                p.status_pemesanan,
                p.waktu_mulai,
                p.waktu_selesai,
                p.lokasi_sesi,

                mu.id_murid,
                mu.nama_murid,
                mu.email        AS email_murid,
                mu.kelas,

                g.id_guru,
                g.nama_guru,
                g.email_guru,

                m.id_materi,
                m.nama_materi,
                m.jenjang,

                s.id_sesi,
                s.status_sesi,

                pb.id_pembayaran,
                pb.metode_pembayaran,
                pb.nominal,
                pb.status_pembayaran,
                pb.tanggal_pembayaran,

                f.id_feedback,
                f.rating,
                f.komentar

            FROM pemesanan p
            JOIN Murid    mu ON p.id_murid  = mu.id_murid
            JOIN Guru     g  ON p.id_guru   = g.id_guru
            JOIN Materi   m  ON p.id_materi = m.id_materi
            LEFT JOIN Sesi       s  ON s.id_pemesanan = p.id_pemesanan
            LEFT JOIN Pembayaran pb ON pb.id_sesi      = s.id_sesi
            LEFT JOIN Feedback   f  ON f.id_sesi       = s.id_sesi

            WHERE ${role === 'Murid' ? 'p.id_murid' : 'p.id_guru'} = ?
            ORDER BY p.waktu_mulai DESC
        `;

        const rows = await conn.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Belum ada riwayat pemesanan."
            });
        }

        const history = rows.map(row => ({
            id_pemesanan:     row.id_pemesanan,
            status_pemesanan: row.status_pemesanan,
            waktu_mulai:      row.waktu_mulai,
            waktu_selesai:    row.waktu_selesai,
            lokasi_sesi:      row.lokasi_sesi,

            murid: {
                id_murid:   row.id_murid,
                nama_murid: row.nama_murid,
                email:      row.email_murid,
                kelas:      row.kelas,
            },

            guru: {
                id_guru:    row.id_guru,
                nama_guru:  row.nama_guru,
                email_guru: row.email_guru,
            },

            materi: {
                id_materi:   row.id_materi,
                nama_materi: row.nama_materi,
                jenjang:     row.jenjang,
            },

            sesi: row.id_sesi ? {
                id_sesi:     row.id_sesi,
                status_sesi: row.status_sesi,
            } : null,

            pembayaran: row.id_pembayaran ? {
                id_pembayaran:      row.id_pembayaran,
                metode_pembayaran:  row.metode_pembayaran,
                nominal:            row.nominal,
                status_pembayaran:  row.status_pembayaran,
                tanggal_pembayaran: row.tanggal_pembayaran,
            } : null,

            feedback: row.id_feedback ? {
                id_feedback: row.id_feedback,
                rating:      row.rating,
                komentar:    row.komentar,
            } : null,
        }));

        res.json({
            success: true,
            data: history
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { getHistory };