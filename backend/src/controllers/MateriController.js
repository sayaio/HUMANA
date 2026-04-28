// controllers/MateriController.js
const pool = require('../database');

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
    const [rows] = await pool.query(
      `SELECT id_materi AS id, nama_materi AS namaMateri, kelas, jurusan, deskripsi AS deskripsiMateri
       FROM materi
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
    const [rows] = await pool.query(
      `SELECT id_materi AS id, nama_materi AS namaMateri, kelas, jurusan, deskripsi AS deskripsiMateri
       FROM materi
       ORDER BY id_materi ASC`
    );

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
    const [rows] = await pool.query(
      `SELECT id_mapel, nama_mapel
       FROM matapelajaran
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

module.exports = { getMateriBySubject, getAllMateri, getAllMapel };