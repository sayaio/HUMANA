const pool = require('../database');

// GET — ambil materi yang sudah dipilih guru
const getMateriGuru = async (req, res) => {
  try {
    const { id_guru } = req.params;
    if (!id_guru) return res.status(400).json({ success: false, message: 'id_guru wajib diisi.' });

    const result = await pool.query(
      `SELECT mg.id_materi, m.nama_materi, m.kelas, m.id_mapel,
              mp.nama_mapel, mp.jenjang
       FROM MateriGuru mg
       JOIN Materi m ON mg.id_materi = m.id_materi
       JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
       WHERE mg.id_guru = ?`,
      [id_guru]
    );
    const rows = Array.isArray(result[0]) ? result[0] : Array.isArray(result) ? result : [];
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getMateriGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST — simpan materi terpilih (batch)
const simpanMateriGuru = async (req, res) => {
  try {
    const { id_guru, id_materi_list } = req.body;
    
    // Validasi input
    if (!id_guru || !Array.isArray(id_materi_list) || id_materi_list.length === 0) {
      return res.status(400).json({ success: false, message: 'id_guru dan id_materi_list wajib diisi.' });
    }
    const queries = id_materi_list.map(id_materi => {
      return pool.query(
        `INSERT IGNORE INTO MateriGuru (id_guru, id_materi) VALUES (?, ?)`,
        [id_guru, id_materi]
      );
    });

    // Tunggu sampai semua data selesai dimasukkan ke database
    await Promise.all(queries);

    res.status(201).json({ success: true, message: 'Materi berhasil disimpan.' });
  } catch (error) {
    console.error('Error simpanMateriGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE — hapus satu materi guru
const hapusMateriGuru = async (req, res) => {
  try {
    const { id_guru, id_materi } = req.params;
    if (!id_guru || !id_materi) return res.status(400).json({ success: false, message: 'id_guru dan id_materi wajib diisi.' });

    await pool.query(
      'DELETE FROM MateriGuru WHERE id_guru = ? AND id_materi = ?',
      [id_guru, id_materi]
    );
    res.status(200).json({ success: true, message: 'Materi berhasil dihapus.' });
  } catch (error) {
    console.error('Error hapusMateriGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMateriGuru, simpanMateriGuru, hapusMateriGuru };