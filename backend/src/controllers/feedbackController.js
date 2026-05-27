const pool = require('../database');
const Guru = require('../classes/Guru');
const Feedback = require('../classes/Feedback');

const submitFeedback = async (req, res) => {
    const { id_sesi, komentar, rating } = req.body;

    try {
        // 1. Simpan feedback baru ke tabel Feedback
        await pool.query(
            'INSERT INTO Feedback (id_sesi, komentar, rating) VALUES (?, ?, ?)',
            [id_sesi, komentar, rating]
        );

        // 2. Cari tahu id_guru dari id_sesi ini (Asumsi tabel Sesi memiliki kolom id_guru)
        const [sesiRows] = await pool.query(
            'SELECT id_guru FROM Sesi WHERE id_sesi = ?',
            [id_sesi]
        );

        if (sesiRows.length === 0) {
            return res.status(442).json({ success: false, message: 'Sesi tidak ditemukan' });
        }
        const id_guru = sesiRows[0].id_guru;

        // 3. Ambil data profil Guru untuk keperluan instansiasi Class Guru
        const [guruRows] = await pool.query(
            'SELECT * FROM Guru WHERE Guru.id_guru = ?',
            [id_guru]
        );
        const gData = guruRows[0];

        // 4. Ambil semua data feedback milik Guru ini dari database untuk dimasukkan ke objek
        // Asumsi: Kita join Feedback ke Sesi untuk tahu feedback mana saja yang ditujukan ke id_guru ini
        const [allFeedbacks] = await pool.query(
            `SELECT f.* FROM Feedback f 
             INNER JOIN Sesi s ON f.id_sesi = s.id_sesi 
             WHERE s.id_guru = ?`,
            [id_guru]
        );
        console.log(`Log Sistem: Menghitung feedback untuk Guru ID ${id_guru}`);
        console.log(`Jumlah feedback ditemukan di DB: ${allFeedbacks.length}`);

        // 5. Menerapkan OOP: Instansiasi objek Guru
        const objekGuru = new Guru(
            gData.username, gData.email, gData.password, gData.nama_user,
            gData.id_guru, gData.is_active, gData.no_telepon, gData.jenis_kelamin, gData.alamat
        );

        // 6. Push semua feedback (sebagai instance Class Feedback) ke dalam objek Guru
        allFeedbacks.forEach(fb => {
            // Instansiasi class Feedback sesuai struktur Anda (misal menerima rating & komentar)
            const objekFeedback = new Feedback(fb.rating, fb.komentar);
            objekGuru.addFeedback(objekFeedback);
        });

        // 7. Hitung rating baru memanfaatkan method getRating() dari Class Guru
        const ratingBaru = objekGuru.getRating();
        console.log(`Hasil Perhitungan getRating() Objek: ${ratingBaru}`);

        // 8. (Opsional) Update kolom rating rata-rata di tabel Guru jika Anda menyimpannya secara redundan demi performa query
        await pool.query(
            'UPDATE Guru SET rating = ? WHERE id_guru = ?',
            [ratingBaru, id_guru]
        );

        // 9. Kembalikan response sukses bersama nilai rating baru
        res.status(201).json({
            success: true,
            message: 'Feedback berhasil dikirim',
            ratingBaru: ratingBaru // Kirim ini agar frontend bisa langsung update
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengirim feedback' });
    }
};

const getGuruRating = async (req, res) => {
    const { id_guru } = req.params;

    try {
        // 1. Ambil data dasar Guru
        const guruRows = await pool.query(
            'SELECT * FROM Guru WHERE id_guru = ?',
            [id_guru]
        );

        if (guruRows.length === 0) {
            return res.status(444).json({ success: false, message: 'Guru tidak ditemukan' });
        }
        const gData = guruRows[0];

        // 2. Ambil seluruh feedback untuk menghitung rating riil secara OOP
        const allFeedbacks = await pool.query(
            `SELECT f.* FROM Feedback f 
             INNER JOIN Pemesanan p ON f.id_pemesanan = p.id_pemesanan
             WHERE p.id_guru = ?`,
            [id_guru]
        );

        // 3. Instansiasi Objek Guru
        const objekGuru = new Guru(
            gData.username, gData.email, gData.password, gData.nama_user,
            gData.id_guru, gData.is_active, gData.no_telepon, gData.jenis_kelamin, gData.alamat
        );

        // 4. Masukkan kumpulan feedback ke dalam Objek Guru
        allFeedbacks.forEach(fb => {
            const objekFeedback = new Feedback(fb.rating, fb.komentar);
            objekGuru.addFeedback(objekFeedback);
        });

        // 5. Ambil data gabungan lewat getProfile()
        const profilLengkap = objekGuru.getProfile();

        // 6. Tambahkan data rating dinamis hasil kalkulasi getRating() ke dalam response
        const dataResponse = {
            ...profilLengkap,
            id: gData.id_guru,
            id_guru: gData.id_guru,
            username: gData.username,
            email: gData.email,             // <-- Ini yang bikin emailnya hilang kalau gak dikirim!
            name: gData.nama_guru || gData.nama_user || gData.nama || profilLengkap.name, // Ambil langsung dari DB
            nama: gData.nama_guru || gData.nama_user || gData.nama || profilLengkap.nama,
            no_telepon: gData.no_telepon,
            jenis_kelamin: gData.jenis_kelamin,
            alamat: gData.alamat,
            role: 'Guru'
        };

        return res.status(200).json({
            success: true,
            data: dataResponse // <-- Kirim data yang sudah di-mapping dengan aman
        });

    } catch (error) {
        console.error("Error pada getGuruProfile:", error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
    }
};

module.exports = {
    submitFeedback,
    getGuruRating
};