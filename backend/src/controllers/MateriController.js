// controllers/MateriController.js
const { fetchQuery, executeQuery } = require('../utils/dbHelper');

/**
 * GET /api/materi?id_mapel=1
 * Fetch semua materi berdasarkan id mata pelajaran
 */
const getMateriBySubject = async (req, res) => {
  const { id_mapel } = req.query;

  if (!id_mapel) {
    return res.status(400).json({
      success: false,
      message: 'Parameter id_mapel wajib diisi.',
    });
  }

  try {
    const rows = await fetchQuery(
      `SELECT id_materi AS id, nama_materi AS namaMateri, kelas, jurusan, deskripsi AS deskripsiMateri
       FROM Materi
       WHERE id_mapel = ?
       ORDER BY id_materi ASC`,
      [id_mapel]
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('[MateriController] Error fetching materi:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data materi.',
    });
  }
};

/**
 * GET /api/materi/all
 * Fetch semua materi
 */
const getAllMateri = async (req, res) => {
  try {
    const rows = await fetchQuery(`
        SELECT id_mapel, nama_mapel
        FROM MataPelajaran
        ORDER BY id_mapel ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('[MateriController] Error fetching all materi:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil semua data materi.',
    });
  }
};

/**
 * GET /api/mapel
 * Fetch semua mata pelajaran dari tabel matapelajaran
 */
const getAllMapel = async (req, res) => {
  try {
    const rows = await fetchQuery(
      `SELECT id_mapel, nama_mapel
       FROM MataPelajaran
       ORDER BY id_mapel ASC`
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('[MateriController] Error fetching mapel:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data mata pelajaran.',
    });
  }
};

const updateMateriGuru = async (req, res) => {
    const { id_guru, daftar_id_materi } = req.body; // daftar_id_materi berbentuk array, contoh: [1, 2, 5]

    // Validasi input dasar
    if (!id_guru || !Array.isArray(daftar_id_materi)) {
        return res.status(400).json({ message: "Data id_guru atau daftar_id_materi tidak valid." });
    }

    try {
        // Hapus semua kompetensi materi yang sebelumnya pernah dipilih oleh guru ini
        await executeQuery(
            `DELETE FROM MateriGuru WHERE id_guru = ?`, 
            [id_guru]
        );

        // Jika guru menceklis materi (array tidak kosong), lakukan bulk insert
        if (daftar_id_materi.length > 0) {
            const values = daftar_id_materi.map(id_materi => [id_guru, id_materi]);
            await executeQuery(
                `INSERT INTO MateriGuru (id_guru, id_materi) VALUES ?`, 
                [values]
            );
        }

        return res.status(200).json({ message: "Kompetensi materi guru berhasil diperbarui." });

    } catch (error) {
        console.error("Error di updateMateriGuru:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat menyimpan materi guru." });
    }
};

module.exports = { getMateriBySubject, getAllMateri, getAllMapel, updateMateriGuru };