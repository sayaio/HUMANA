// controllers/HistoryController.js
const pool = require('../database');

/**
 * GET /api/history/:role/:id
 * Fetch riwayat sesi berdasarkan role (Murid/Guru) dan id nya
 */
const getHistory = async (req, res) => {
  const { role, id } = req.params;

  if (!role || !id) {
    return res.status(400).json({
      success: false,
      message: 'Parameter role dan id wajib diisi.',
    });
  }

  if (role !== 'Murid' && role !== 'Guru') {
    return res.status(400).json({
      success: false,
      message: 'Role harus bernilai Murid atau Guru.',
    });
  }

  try {
    const whereClause = role === 'Murid' ? 'p.id_murid = ?' : 'p.id_guru = ?';

    const [rows] = await pool.query(
      `SELECT
        p.id_pemesanan,
        p.status_pemesanan,
        p.waktu_mulai,
        p.waktu_selesai,
        p.lokasi_sesi,

        mu.id_murid,
        mu.nama_murid,
        mu.email        AS email_murid,
        mu.kelas        AS kelas_murid,

        g.id_guru,
        g.nama_guru,
        g.email_guru,

        mp.id_mapel,
        mp.nama_mapel,

        m.id_materi,
        m.nama_materi,
        m.kelas         AS kelas_materi,
        m.jurusan,

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
      JOIN Murid          mu  ON p.id_murid      = mu.id_murid
      JOIN Guru           g   ON p.id_guru        = g.id_guru
      JOIN Materi         m   ON p.id_materi      = m.id_materi
      JOIN MataPelajaran  mp  ON m.id_mapel        = mp.id_mapel
      LEFT JOIN Sesi      s   ON s.id_pemesanan   = p.id_pemesanan
      LEFT JOIN Pembayaran pb ON pb.id_sesi        = s.id_sesi
      LEFT JOIN Feedback  f   ON f.id_sesi         = s.id_sesi

      WHERE ${whereClause}
      ORDER BY p.waktu_mulai DESC`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Belum ada riwayat pemesanan.',
      });
    }

    const data = rows.map(row => ({
      id_pemesanan:     row.id_pemesanan,
      status_pemesanan: row.status_pemesanan,
      waktu_mulai:      row.waktu_mulai,
      waktu_selesai:    row.waktu_selesai,
      lokasi_sesi:      row.lokasi_sesi,

      murid: {
        id_murid:   row.id_murid,
        nama_murid: row.nama_murid,
        email:      row.email_murid,
        kelas:      row.kelas_murid,
      },

      guru: {
        id_guru:    row.id_guru,
        nama_guru:  row.nama_guru,
        email_guru: row.email_guru,
      },

      mata_pelajaran: {
        id_mapel:   row.id_mapel,
        nama_mapel: row.nama_mapel,
      },

      materi: {
        id_materi:   row.id_materi,
        nama_materi: row.nama_materi,
        kelas:       row.kelas_materi,
        jurusan:     row.jurusan,
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

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('[HistoryController] Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data riwayat.',
    });
  }
};

module.exports = { getHistory };