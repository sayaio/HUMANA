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
                pemesanan.id_pemesanan,
                pemesanan.status_pemesanan, 
                pemesanan.waktu_mulai,
                pemesanan.waktu_selesai,
                pemesanan.lokasi_sesi,
                
                murid.id_murid,
                murid.nama_murid, 
                murid.email AS email_murid,
                murid.kelas AS kelas_murid,
                
                guru.id_guru,
                guru.nama_guru, 
                guru.email_guru,
                
                materi.id_materi,
                materi.nama_materi, 
                materi.kelas AS kelas_materi,
                materi.jurusan,
                
                mapel.id_mapel,
                mapel.nama_mapel
            FROM Pemesanan pemesanan
            JOIN Murid murid ON murid.id_murid = pemesanan.id_murid
            JOIN Guru guru ON guru.id_guru = pemesanan.id_guru
            LEFT JOIN Materi materi ON materi.id_materi = pemesanan.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            WHERE (pemesanan.status_pemesanan = 'selesai' OR pemesanan.status_pemesanan = 'ditolak') 
            AND (${whereClause} = ?)
            ORDER BY pemesanan.waktu_mulai DESC;
        `;

        const rows = await pool.query(query, [id]);

        console.log(`Found ${rows.length} history records for ${userRole} ID ${id}`);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Belum ada riwayat pemesanan.' });
        }

        const data = rows.map(row => {
            const sesi = new PemesananSesi(
                row.nama_murid,   // murid
                row.nama_guru,    // guru
                row.nama_materi,  // materi
                row.waktu_mulai,  // waktuMulai
                row.waktu_selesai, // waktuSelesai
                row.lokasi_sesi   // lokasiSesi
            );

            sesi.id_pemesanan = row.id_pemesanan;
            sesi.statusPemesanan = row.status_pemesanan;

            return {
                ...sesi.toJSON(),
                murid: {
                    id_murid: row.id_murid,
                    email: row.email_murid,
                    kelas: row.kelas_murid,
                },
                guru: {
                    id_guru: row.id_guru,
                    nama_guru: row.nama_guru,
                    email_guru: row.email_guru,
                },
                mata_pelajaran: {
                    id_mapel: row.id_mapel,
                    nama_mapel: row.nama_mapel,
                },
                materi: {
                    id_materi: row.id_materi,
                    kelas: row.kelas_materi,
                    jurusan: row.jurusan,
                },
                sesi: null,
                pembayaran: null,
                feedback: null
            };
        });

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('[HistoryController] Error fetching history:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data riwayat.' });
    }
};

const getActiveSchedule = async (req, res) => {
    console.log(`[Backend] Ada request masuk untuk role: ${req.params.role}, id: ${req.params.id}`);
    const { role, id } = req.params;
    const userRole = role.toLowerCase();
    const whereClause = userRole === 'murid' ? 'murid.id_murid' : 'guru.id_guru';

    try {
        const query = `
            SELECT 
                pemesanan.id_pemesanan, pemesanan.status_pemesanan, 
                pemesanan.waktu_mulai, pemesanan.waktu_selesai,
                murid.nama_murid, guru.nama_guru, 
                materi.nama_materi, mapel.nama_mapel
            FROM Pemesanan pemesanan
            JOIN Murid murid ON murid.id_murid = pemesanan.id_murid
            JOIN Guru guru ON guru.id_guru = pemesanan.id_guru
            LEFT JOIN Materi materi ON materi.id_materi = pemesanan.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            WHERE (pemesanan.status_pemesanan = 'dikonfirmasi' OR pemesanan.status_pemesanan = 'menunggu konfirmasi') 
            AND (${whereClause} = ?)
            ORDER BY pemesanan.waktu_mulai ASC;
        `;

        const rows = await pool.query(query, [id]);

        console.log(`[Backend] Ditemukan ${rows.length} jadwal aktif untuk ID ${id}`);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHistory, getActiveSchedule };