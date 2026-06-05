// controllers/historyController.js
const pool = require('../database');
const PemesananSesi = require('../classes/PemesananSesi');

const getHistory = async (req, res) => {
    const { role, id } = req.params;
    const userRole = role.toLowerCase();

    if (!role || !id) {
        return res.status(400).json({ success: false, message: 'Parameter role dan id wajib diisi.' });
    }

    if (userRole !== 'murid' && userRole !== 'guru') {
        return res.status(400).json({ success: false, message: 'Role harus bernilai Murid atau Guru.' });
    }

    try {
        const whereClause = userRole === 'murid' ? 'murid.id_murid' : 'guru.id_guru';

        const query = `
    SELECT 
        pemesanan.id_pemesanan, pemesanan.status_pemesanan, 
        pemesanan.waktu_mulai, pemesanan.waktu_selesai, pemesanan.lokasi_sesi,
        murid.id_murid, murid.nama_murid, murid.email AS email_murid, murid.kelas AS kelas_murid,
        guru.id_guru, guru.nama_guru, guru.email_guru,
        materi.id_materi, materi.nama_materi, materi.kelas AS kelas_materi, materi.jurusan,
        mapel.id_mapel, mapel.nama_mapel,
        bayar.biaya_sesi,
        bayar.biaya_jarak,
        bayar.nominal,
        bayar.status_pembayaran,
        feedback.rating AS feedback_rating,
        feedback.komentar AS feedback_komentar
    FROM Pemesanan pemesanan
    JOIN Murid murid ON murid.id_murid = pemesanan.id_murid
    JOIN Guru guru ON guru.id_guru = pemesanan.id_guru
    LEFT JOIN Materi materi ON materi.id_materi = pemesanan.id_materi
    LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
    LEFT JOIN Pembayaran bayar ON bayar.id_pemesanan = pemesanan.id_pemesanan
    LEFT JOIN Feedback feedback ON feedback.id_pemesanan = pemesanan.id_pemesanan
    WHERE pemesanan.status_pemesanan IN ('selesai', 'dibatalkan', 'dibatalkan_murid', 'dibatalkan_guru')
    AND (${whereClause} = ?)
    ORDER BY pemesanan.waktu_mulai DESC;
`;

        const rows = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'Belum ada riwayat pemesanan.' });
        }

        const data = rows.map(row => {
            const sesi = new PemesananSesi(
                row.nama_murid, row.nama_guru, row.nama_materi,
                row.waktu_mulai, row.waktu_selesai, row.lokasi_sesi
            );
            sesi.id_pemesanan = row.id_pemesanan;
            sesi.statusPemesanan = row.status_pemesanan;

            const nominalBayar = row.nominal != null ? Number(row.nominal) : null;
            const biayaSesi = row.biaya_sesi != null ? Number(row.biaya_sesi) : null;
            const biayaJarak = row.biaya_jarak != null ? Number(row.biaya_jarak) : null;

            const jsonSesi = sesi.toJSON();

            return {
                ...jsonSesi,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
                biaya_sesi: biayaSesi ?? jsonSesi.biaya_sesi,
                biaya_jarak: biayaJarak ?? jsonSesi.biaya_jarak,
                nominal: nominalBayar,
                harga: nominalBayar,
                harga_total: nominalBayar ?? jsonSesi.harga_total,
                murid: { id_murid: row.id_murid, nama_murid: row.nama_murid, email: row.email_murid, kelas: row.kelas_murid },
                guru: { id_guru: row.id_guru, nama_guru: row.nama_guru, email_guru: row.email_guru },
                mata_pelajaran: { id_mapel: row.id_mapel, nama_mapel: row.nama_mapel },
                materi: { id_materi: row.id_materi, kelas: row.kelas_materi, jurusan: row.jurusan },
                pembayaran: nominalBayar != null ? {
                    biaya_sesi: biayaSesi,
                    biaya_jarak: biayaJarak,
                    nominal: nominalBayar,
                    total_bayar: nominalBayar,
                    status_pembayaran: row.status_pembayaran,
                } : null,
                sesi: null,
                feedback: row.feedback_rating != null ? {
                    rating: Number(row.feedback_rating),
                    komentar: row.feedback_komentar || '',
                } : null,
            };
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[HistoryController] Error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
    }
};

const getActiveSchedule = async (req, res) => {
    const { role, id } = req.params;
    const userRole = role.toLowerCase();

    if (userRole !== 'murid' && userRole !== 'guru') {
        return res.status(400).json({ success: false, message: 'Role harus bernilai Murid atau Guru.' });
    }

    const whereClause = userRole === 'murid' ? 'murid.id_murid' : 'guru.id_guru';

    try {
        const query = `
            SELECT 
                pemesanan.id_pemesanan, pemesanan.status_pemesanan, 
                pemesanan.waktu_mulai, pemesanan.waktu_selesai, pemesanan.lokasi_sesi,
                murid.id_murid, murid.nama_murid, murid.kelas AS kelas_murid,
                guru.id_guru, guru.nama_guru, 
                materi.id_materi, materi.nama_materi, 
                mapel.id_mapel, mapel.nama_mapel,
                bayar.status_pembayaran, bayar.metode_pembayaran,
                bayar.biaya_sesi, bayar.biaya_jarak, bayar.nominal
            FROM Pemesanan pemesanan
            JOIN Murid murid ON murid.id_murid = pemesanan.id_murid
            JOIN Guru guru ON guru.id_guru = pemesanan.id_guru
            LEFT JOIN Materi materi ON materi.id_materi = pemesanan.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            LEFT JOIN Pembayaran bayar ON bayar.id_pemesanan = pemesanan.id_pemesanan
            WHERE pemesanan.status_pemesanan IN ('dikonfirmasi', 'menunggu konfirmasi', 'berlangsung')
            AND (${whereClause} = ?)
            ORDER BY pemesanan.waktu_mulai ASC;
        `;

        const rows = await pool.query(query, [id]);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHistory, getActiveSchedule };