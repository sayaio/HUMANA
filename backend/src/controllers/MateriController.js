// controllers/MateriController.js
const pool = require('../database');
 // sesuaikan path koneksi MariaDB kamu

/**
 * GET /api/materi?subjectName=Matematika
 * Fetch semua materi berdasarkan nama mata pelajaran (namaMateri)
 */
const getMateriBySubject = async (req, res) => {
  const { subjectName } = req.query;

  if (!subjectName) {
    return res.status(400).json({
      success: false,
      message: 'Parameter subjectName wajib diisi.',
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id_materi AS id, nama_materi AS namaMateri, kelas, deskripsi_materi AS deskripsiMateri
       FROM materi
       WHERE nama_materi = ?
       ORDER BY id_materi ASC`,
      [subjectName]
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
 * Fetch semua materi (opsional, untuk keperluan lain)
 */
const getAllMateri = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_materi AS id, nama_materi AS namaMateri, kelas, deskripsi_materi AS deskripsiMateri
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

module.exports = { getMateriBySubject, getAllMateri };