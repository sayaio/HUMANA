// controllers/BankerController.js
const pool = require('../database');

// GET /api/sesi/detail/:id
// Menampilkan detail ringkasan pesanan sebelum bayar
// Mengambil data dari Sesi JOIN pemesanan + murid + guru + materi + matapelajaran + pembayaran
const getSesiDetail = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Parameter id wajib diisi.' });
    }

    try {
        const query = `
            SELECT
                sesi.id_sesi,
                sesi.status_sesi,

                pemesanan.id_pemesanan,
                pemesanan.waktu_mulai,
                pemesanan.waktu_selesai,
                pemesanan.lokasi_sesi,
                pemesanan.status_pemesanan,
                TIMESTAMPDIFF(MINUTE, pemesanan.waktu_mulai, pemesanan.waktu_selesai) AS durasi_menit,

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
                mapel.nama_mapel,

                pembayaran.id_pembayaran,
                pembayaran.metode_pembayaran,
                pembayaran.nominal,
                pembayaran.status_pembayaran,
                pembayaran.tanggal_pembayaran
            FROM Sesi sesi
            JOIN pemesanan ON pemesanan.id_pemesanan = sesi.id_pemesanan
            JOIN Murid murid ON murid.id_murid = pemesanan.id_murid
            JOIN Guru guru ON guru.id_guru = pemesanan.id_guru
            LEFT JOIN Materi materi ON materi.id_materi = pemesanan.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            LEFT JOIN Pembayaran pembayaran ON pembayaran.id_sesi = sesi.id_sesi
            WHERE sesi.id_sesi = ?
            LIMIT 1;
        `;

        const rows = await pool.query(query, [id]);

        console.log(`[BankerController] getSesiDetail: Found ${rows.length} result for sesi ID ${id}`);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Detail sesi tidak ditemukan.' });
        }

        const row = rows[0];

        const data = {
            id_sesi: row.id_sesi,
            status_sesi: row.status_sesi,

            pemesanan: {
                id_pemesanan: row.id_pemesanan,
                status_pemesanan: row.status_pemesanan,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
                lokasi_sesi: row.lokasi_sesi,
                durasi_menit: Number(row.durasi_menit),
            },
            murid: {
                id_murid: row.id_murid,
                nama_murid: row.nama_murid,
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
                nama_materi: row.nama_materi,
                kelas: row.kelas_materi,
                jurusan: row.jurusan,
            },
            pembayaran: {
                id_pembayaran: row.id_pembayaran,
                metode_pembayaran: row.metode_pembayaran,
                nominal: row.nominal,
                status_pembayaran: row.status_pembayaran,
                tanggal_pembayaran: row.tanggal_pembayaran,
            },
        };

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('[BankerController] Error fetching sesi detail:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil detail sesi.' });
    }
};

// PUT /api/sesi/bayar-simulasi
// Dipicu tombol "Cek Status" di halaman QR
// Mengubah status_sesi dari 'menunggu' menjadi 'berlangsung'
// dan status_pembayaran di tabel Pembayaran dari 'menunggu' menjadi 'lunas'
const bayarSimulasi = async (req, res) => {
    const { id_sesi } = req.body;

    if (!id_sesi) {
        return res.status(400).json({ success: false, message: 'Parameter id_sesi wajib diisi.' });
    }

    try {
        // Cek apakah sesi ada dan statusnya masih 'menunggu'
        const checkQuery = `
            SELECT
                sesi.id_sesi,
                sesi.status_sesi,
                pembayaran.id_pembayaran,
                pembayaran.status_pembayaran
            FROM Sesi sesi
            LEFT JOIN Pembayaran pembayaran ON pembayaran.id_sesi = sesi.id_sesi
            WHERE sesi.id_sesi = ?
            LIMIT 1;
        `;

        const rows = await pool.query(checkQuery, [id_sesi]);

        console.log(`[BankerController] bayarSimulasi: Checking sesi ID ${id_sesi}`);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan.' });
        }

        const sesi = rows[0];

        if (sesi.status_sesi !== 'menunggu') {
            return res.status(400).json({
                success: false,
                message: `Status sesi saat ini adalah '${sesi.status_sesi}'. Hanya sesi dengan status 'menunggu' yang dapat diproses.`,
            });
        }

        // Update status_sesi menjadi 'berlangsung'
        const updateSesiQuery = `
            UPDATE Sesi
            SET status_sesi = 'berlangsung'
            WHERE id_sesi = ?;
        `;
        await pool.query(updateSesiQuery, [id_sesi]);

        // Update status_pembayaran menjadi 'lunas' dan isi tanggal_pembayaran dengan hari ini
        if (sesi.id_pembayaran) {
            const updatePembayaranQuery = `
                UPDATE Pembayaran
                SET status_pembayaran = 'lunas',
                    tanggal_pembayaran = CURDATE()
                WHERE id_pembayaran = ?;
            `;
            await pool.query(updatePembayaranQuery, [sesi.id_pembayaran]);
        }

        console.log(`[BankerController] bayarSimulasi: Sesi ID ${id_sesi} berhasil diubah menjadi 'berlangsung'`);

        return res.status(200).json({
            success: true,
            message: 'Pembayaran berhasil dikonfirmasi. Status sesi telah diubah menjadi berlangsung.',
            data: {
                id_sesi,
                status_sesi_sebelumnya: 'menunggu',
                status_sesi_sekarang: 'berlangsung',
                status_pembayaran_sekarang: 'lunas',
            },
        });

    } catch (error) {
        console.error('[BankerController] Error processing bayar simulasi:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses pembayaran.' });
    }
};

module.exports = { getSesiDetail, bayarSimulasi };