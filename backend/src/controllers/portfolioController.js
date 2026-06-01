const pool = require('../database');
const Portfolio = require('../classes/Portfolio');

// GET — ambil semua portfolio milik guru
const getPortfolioByGuru = async (req, res) => {
  try {
    const { id_guru } = req.params;
    if (!id_guru) return res.status(400).json({ success: false, message: 'id_guru wajib diisi.' });

    const result = await pool.query(
      'SELECT * FROM Portfolio WHERE id_guru = ? ORDER BY tanggal_mulai DESC',
      [id_guru]
    );

    const rows = Array.isArray(result[0]) ? result[0] : Array.isArray(result) ? result : [result];
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getPortfolioByGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST — tambah portfolio baru
const tambahPortfolio = async (req, res) => {
  try {
    const { id_guru, judul, deskripsi, tipe_portfolio, bukti, tanggal_mulai, tanggal_selesai } = req.body;

    // Validasi
    if (!id_guru || !judul || !deskripsi || !tipe_portfolio || !bukti) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    // Pakai class Portfolio
    const porto = new Portfolio(id_guru, judul, deskripsi, tipe_portfolio, bukti, tanggal_mulai, tanggal_selesai);
    const data  = porto.toJSON();

    const result = await pool.query(
      `INSERT INTO Portfolio (id_guru, judul, deskripsi, tipe_portfolio, bukti, tanggal_mulai, tanggal_selesai)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.id_guru, data.judul, data.deskripsi, data.tipe_portfolio, data.bukti, data.tanggal_mulai, data.tanggal_selesai]
    );

    const insertId = result[0]?.insertId || result.insertId || null;
    res.status(201).json({
      success: true,
      message: 'Portofolio berhasil ditambahkan.',
      id_portfolio: insertId?.toString() ?? null
    });
  } catch (error) {
    console.error('Error tambahPortfolio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE — hapus portfolio berdasarkan id
const hapusPortfolio = async (req, res) => {
  try {
    const { id_portfolio } = req.params;
    if (!id_portfolio) return res.status(400).json({ success: false, message: 'id_portfolio wajib diisi.' });

    await pool.query('DELETE FROM Portfolio WHERE id_portfolio = ?', [id_portfolio]);
    res.status(200).json({ success: true, message: 'Portofolio berhasil dihapus.' });
  } catch (error) {
    console.error('Error hapusPortfolio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPortfolioByGuru, tambahPortfolio, hapusPortfolio };