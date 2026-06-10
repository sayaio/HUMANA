const { fetchQuery, executeQuery } = require('../utils/dbHelper');
const Guru = require('../classes/Guru');
const Murid = require('../classes/Murid');
const Feedback = require('../classes/Feedback');

const submitFeedback = async (req, res) => {
    const { id_pemesanan, komentar, rating } = req.body;

    // =========================================================================
    // === REVISI VALIDASI IMK: DETEKSI SIMULASI SQL INJECTION RINGAN =======
    // =========================================================================
    // Memblokir karakter pemutus string SQL (') atau komentar SQL (--) demi keamanan tambahan
    const sqlInjectionPattern = /['"\/]|--/g;

    if (komentar && sqlInjectionPattern.test(komentar)) {
        return res.status(400).json({
            success: false,
            message: 'Pengiriman feedback ditolak: Teks ulasan mengandung karakter simbol ilegal yang berpotensi membahayakan sistem!'
        });
    }
    // =========================================================================

    try {
        // 0. Cegah feedback ganda: satu sesi hanya boleh punya satu feedback.
        const sudahAda = await fetchQuery(
            'SELECT id_feedback FROM Feedback WHERE id_pemesanan = ? LIMIT 1',
            [id_pemesanan]
        );
        const sudahAdaRows = sudahAda;
        if (sudahAdaRows && sudahAdaRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Feedback untuk sesi ini sudah pernah dikirim.'
            });
        }

        // 1. Simpan feedback baru ke tabel Feedback
        await executeQuery(
            'INSERT INTO Feedback (id_pemesanan, komentar, rating) VALUES (?, ?, ?)',
            [id_pemesanan, komentar, rating]
        );

        // 2. Cari tahu id_guru dari id_sesi ini (Asumsi tabel Sesi memiliki kolom id_guru)
        const sesiRows = await fetchQuery(
            'SELECT id_guru FROM Pemesanan WHERE id_pemesanan = ?',
            [id_pemesanan]
        );

        if (sesiRows.length === 0) {
            return res.status(442).json({ success: false, message: 'Sesi tidak ditemukan' });
        }
        const id_guru = sesiRows[0].id_guru;

        // 3. Ambil data profil Guru untuk keperluan instansiasi Class Guru
        const guruRows = await fetchQuery(
            'SELECT * FROM Guru WHERE id_guru = ?',
            [id_guru]
        );
        const gData = guruRows[0];

        // 4. Ambil semua data feedback milik Guru ini dari database untuk dimasukkan ke objek
        // Asumsi: Kita join Feedback ke Sesi untuk tahu feedback mana saja yang ditujukan ke id_guru ini
        const allFeedbacks = await fetchQuery(
            `SELECT f.* FROM Feedback f 
             INNER JOIN Pemesanan p ON f.id_pemesanan = p.id_pemesanan 
             WHERE p.id_guru = ?`,
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
        await executeQuery(
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
        // 1. Ambil data dasar Guru (Ambil kolom secara eksplisit agar aman)
        const guruRows = await fetchQuery(
            'SELECT id_guru, username, email_guru, password, nama_guru, is_active, no_telepon, jenis_kelamin, alamat FROM Guru WHERE id_guru = ?',
            [id_guru]
        );

        // Menangani beberapa driver pack yang membungkus baris data di dalam array extra
        const rows = guruRows;

        if (!rows || rows.length === 0) {
            return res.status(444).json({ success: false, message: 'Guru tidak ditemukan' });
        }
        const gData = rows[0];

        // 2. Ambil seluruh feedback untuk menghitung rating riil secara OOP
        const feedbackRows = await fetchQuery(
            `SELECT f.rating, f.komentar FROM Feedback f 
             INNER JOIN Pemesanan p ON f.id_pemesanan = p.id_pemesanan
             WHERE p.id_guru = ?`,
            [id_guru]
        );
        const allFeedbacks = feedbackRows;

        // 3. Instansiasi Objek Guru (Samakan persis dengan di authController/login)
        const statusToggleBoolean = gData.is_active == 1;
        const objekGuru = new Guru(
            gData.username,
            gData.email_guru, // Gunakan email_guru sesuai database
            gData.password,
            gData.nama_guru,
            gData.id_guru,
            statusToggleBoolean,
            gData.no_telepon,
            gData.jenis_kelamin,
            gData.alamat
        );

        // 4. Masukkan kumpulan feedback ke dalam Objek Guru jika ada
        if (allFeedbacks && allFeedbacks.length > 0) {
            allFeedbacks.forEach(fb => {
                const objekFeedback = new Feedback(Number(fb.rating), fb.komentar);
                objekGuru.addFeedback(objekFeedback);
            });
        }

        // 5. Ambil data gabungan lewat getProfile()
        const profilLengkap = objekGuru.getProfile();

        // 6. HITUNG RATING secara OOP dari method class Guru!
        const ratingKalkulasi = objekGuru.getRating();

        // 7. Bentuk respons dengan key yang konsisten sesuai kebutuhan Frontend
        const dataResponse = {
            ...profilLengkap,
            id: gData.id_guru,
            id_guru: gData.id_guru,
            username: gData.username,
            email: gData.email_guru,
            name: gData.nama_guru,
            nama: gData.nama_guru,
            no_telepon: gData.no_telepon,
            jenis_kelamin: profilLengkap.jenis_kelamin, // Mengambil hasil yang sudah di-format oleh class Guru ('Perempuan')
            alamat: gData.alamat,
            rating: ratingKalkulasi, // <--- SEKARANG RATING DINAMIS SUDAH MASUK!
            role: 'Guru'
        };

        return res.status(200).json({
            success: true,
            data: dataResponse
        });

    } catch (error) {
        console.error("Error pada getGuruProfile:", error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
    }
};

const getMuridProfile = async (req, res) => {
    const { id_murid } = req.params;

    try {
        const muridRows = await fetchQuery(
            'SELECT id_murid, username, email, password, nama_murid, no_telepon, jenis_kelamin, alamat, kelas, jurusan FROM Murid WHERE id_murid = ?',
            [id_murid],
        );

        const rows = muridRows;

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Murid tidak ditemukan' });
        }

        const mData = rows[0];
        const objekMurid = new Murid(
            mData.username,
            mData.email,
            mData.password,
            mData.nama_murid,
            mData.id_murid,
            mData.kelas,
            mData.no_telepon,
            mData.jenis_kelamin,
            mData.alamat,
            mData.jurusan,
        );

        const profilLengkap = objekMurid.getProfile();

        const dataResponse = {
            ...profilLengkap,
            id: mData.id_murid,
            id_murid: mData.id_murid,
            username: mData.username,
            email: mData.email,
            name: mData.nama_murid,
            nama: mData.nama_murid,
            no_telepon: profilLengkap.no_telepon,
            jenis_kelamin: profilLengkap.jenis_kelamin,
            alamat: profilLengkap.alamat,
            jenjang_pendidikan: profilLengkap.jenjang_pendidikan,
            kelas_jurusan: profilLengkap.kelas_jurusan,
            role: 'murid',
        };

        return res.status(200).json({
            success: true,
            data: dataResponse,
        });
    } catch (error) {
        console.error('Error pada getMuridProfile:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
    }
};

// Ambil feedback yang sudah tersimpan untuk satu sesi (id_pemesanan).
// Dipakai murid agar saat membuka ulang detail sesi, ulasannya tampil & terkunci.
const getFeedbackByPemesanan = async (req, res) => {
    const { id_pemesanan } = req.params;

    try {
        const rows = await fetchQuery(
            'SELECT id_feedback, id_pemesanan, komentar, rating FROM Feedback WHERE id_pemesanan = ? ORDER BY id_feedback DESC LIMIT 1',
            [id_pemesanan]
        );
        const data = rows;

        if (!data || data.length === 0) {
            return res.status(200).json({ success: true, data: null });
        }

        return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error pada getFeedbackByPemesanan:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil feedback' });
    }
};

module.exports = {
    submitFeedback,
    getGuruRating,
    getMuridProfile,
    getFeedbackByPemesanan
};