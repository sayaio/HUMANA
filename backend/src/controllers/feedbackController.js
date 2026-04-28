const feedback = require('../classes/Feedback');
const db = require('../database'); // Pastikan path ke koneksi database benar

class feedbackController {
  /**
   * Method utama untuk memproses pemberian feedback
   */
  static async berikanFeedback(req, res) {
    // Data yang dikirim dari client (biasanya dari form di frontend)
    const { id_sesi, id_guru, rating, komentar } = req.body;

    // 1. VALIDASI: Memastikan semua data yang diperlukan ada
    if (!id_sesi || !id_guru || !rating || !komentar) {
      return res.status(400).json({
        success: false,
        message: "Data kurang. Mohon lampirkan id_sesi, id_guru, rating, dan komentar."
      });
    }

    // 2. VALIDASI: Rentang rating harus 1-5 (sesuai constraint TINYINT di SQL)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating tidak valid. Harus berada di antara 1 sampai 5."
      });
    }

    try {
      // 3. LOGIKA: Membuat objek Feedback baru
      // Objek dibuat di sini setelah input dinyatakan valid
      const feedbackBaru = new Feedback(rating, komentar);

      // 4. DATABASE: Simpan ke tabel Feedback
      // Menggunakan id_sesi sebagai foreign key sesuai skema tabel Anda
      const queryInsert = `INSERT INTO Feedback (id_sesi, komentar, rating) VALUES (?, ?, ?)`;
      await db.execute(queryInsert, [
        id_sesi, 
        feedbackBaru.getKomentar(), // Mengambil data dari objek
        feedbackBaru.getRating()    // Mengambil data dari objek
      ]);

      // 5. DATABASE: Update rating rata-rata di tabel Guru
      await FeedbackController.sinkronisasiRatingGuru(id_guru);

      return res.status(201).json({
        success: true,
        message: "Feedback berhasil dikirim dan rating guru telah diperbarui."
      });

    } catch (error) {
      console.error("Error pada FeedbackController:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server saat menyimpan feedback."
      });
    }
  }

  /**
   * Method untuk menghitung ulang rata-rata rating guru
   */
  static async sinkronisasiRatingGuru(id_guru) {
    try {
      // Menghitung rata-rata dari semua feedback yang ditujukan ke guru tersebut
      const queryAvg = `
        SELECT AVG(f.rating) as rata_rata 
        FROM Feedback f
        JOIN Sesi s ON f.id_sesi = s.id_sesi
        JOIN pemesanan p ON s.id_pemesanan = p.id_pemesanan
        WHERE p.id_guru = ?`;
      
      const [result] = await db.execute(queryAvg, [id_guru]);
      const ratingBaru = result[0].rata_rata || 0;

      // Update kolom rating di tabel Guru
      await db.execute(
        'UPDATE Guru SET rating = ? WHERE id_guru = ?', 
        [ratingBaru, id_guru]
      );
    } catch (err) {
      console.error("Gagal sinkronisasi rating guru:", err);
    }
  }

    // Di dalam FeedbackController.js
    static async getFeedbackByGuru(req, res) {
        const { id_guru } = req.params;

     try {
        // Query ini menggabungkan tabel Feedback, Sesi, dan Pemesanan 
        // untuk mendapatkan nama murid dan komentar untuk guru tertentu
        const query = `
            SELECT f.id_feedback, f.rating, f.komentar, m.nama_murid, p.waktu_mulai
            FROM Feedback f
            JOIN Sesi s ON f.id_sesi = s.id_sesi
            JOIN pemesanan p ON s.id_pemesanan = p.id_pemesanan
            JOIN Murid m ON p.id_murid = m.id_murid
            WHERE p.id_guru = ?
            ORDER BY p.waktu_mulai DESC`;

        const [rows] = await db.execute(query, [id_guru]);
        
        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
}


module.exports = feedbackController;