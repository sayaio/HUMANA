const pool = require('../database');

const submitFeedback = async (req, res) => {
    // Sesuaikan destructuring agar hanya mengambil kolom yang ada di tabel Anda
    const { id_sesi, komentar, rating } = req.body; 

    try {
        // Query disesuaikan dengan kolom di database Anda: id_sesi, komentar, rating
        await pool.query(
            'INSERT INTO feedback (id_sesi, komentar, rating) VALUES (?, ?, ?)',
            [id_sesi, komentar, rating]
        );

        res.status(201).json({ success: true, message: 'Feedback berhasil dikirim' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengirim feedback' });
    }
};

module.exports = { submitFeedback };