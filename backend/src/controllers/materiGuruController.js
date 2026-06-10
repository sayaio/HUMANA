const pool = require('../database');
const { fetchQuery, executeQuery } = require('../utils/dbHelper');

// GET — ambil materi yang sudah dipilih guru
const getMateriGuru = async (req, res) => {
  try {
    const { id_guru } = req.params;
    if (!id_guru) return res.status(400).json({ success: false, message: 'id_guru wajib diisi.' });

    const rows = await fetchQuery(
      `SELECT mg.id_materi, m.nama_materi, m.kelas, m.id_mapel,
              mp.nama_mapel, mp.jenjang
       FROM MateriGuru mg
       JOIN Materi m ON mg.id_materi = m.id_materi
       JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
       WHERE mg.id_guru = ?`,
      [id_guru]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getMateriGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST — sinkronkan materi terpilih guru (insert yang baru + hapus yang tidak lagi dipilih).
// id_materi_list adalah SELURUH daftar materi yang seharusnya dimiliki guru setelah perubahan.
const simpanMateriGuru = async (req, res) => {
  const { id_guru, id_materi_list } = req.body;

  // Validasi dasar: id_guru harus integer positif, id_materi_list harus array (boleh kosong = hapus semua).
  const idGuruNum = Number(id_guru);
  if (!Number.isInteger(idGuruNum) || idGuruNum <= 0) {
    return res.status(400).json({ success: false, message: 'id_guru tidak valid.' });
  }
  if (!Array.isArray(id_materi_list)) {
    return res.status(400).json({ success: false, message: 'id_materi_list wajib berupa array.' });
  }

  // Sanitasi: hanya integer positif & unik yang diproses (menutup celah input pengguna).
  const cleanList = [...new Set(
    id_materi_list
      .map(x => Number(x))
      .filter(x => Number.isInteger(x) && x > 0)
  )];

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    if (cleanList.length > 0) {
      const placeholders = cleanList.map(() => '?').join(',');
      // 1. Hapus materi guru yang TIDAK ada lagi di daftar terpilih.
      await conn.query(
        `DELETE FROM MateriGuru WHERE id_guru = ? AND id_materi NOT IN (${placeholders})`,
        [idGuruNum, ...cleanList]
      );
      // 2. Tambahkan materi terpilih (IGNORE agar duplikat tidak error).
      const valueTuples = cleanList.map(() => '(?, ?)').join(',');
      const insertParams = [];
      cleanList.forEach(id => insertParams.push(idGuruNum, id));
      await conn.query(
        `INSERT IGNORE INTO MateriGuru (id_guru, id_materi) VALUES ${valueTuples}`,
        insertParams
      );
    } else {
      // Daftar kosong -> guru menghapus seluruh materinya.
      await conn.query('DELETE FROM MateriGuru WHERE id_guru = ?', [idGuruNum]);
    }

    await conn.commit();
    res.status(200).json({ success: true, message: 'Materi berhasil disimpan.' });
  } catch (error) {
    if (conn) {
      try { await conn.rollback(); } catch (e) { /* abaikan error rollback */ }
    }
    console.error('Error simpanMateriGuru:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (conn) conn.release();
  }
};

// DELETE — hapus satu materi guru
const hapusMateriGuru = async (req, res) => {
  try {
    const { id_guru, id_materi } = req.params;
    if (!id_guru || !id_materi) return res.status(400).json({ success: false, message: 'id_guru dan id_materi wajib diisi.' });

    await executeQuery(
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