// controllers/BankerController.js
const pool = require('../database');
const Pembayaran = require('../classes/Pembayaran');
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

const getSesiDetail = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Parameter id wajib diisi.' });

    try {
        const query = `
            SELECT
                p.id_pemesanan,
                p.status_pemesanan,
                p.waktu_mulai,
                p.waktu_selesai,
                p.lokasi_sesi,
                TIMESTAMPDIFF(MINUTE, p.waktu_mulai, p.waktu_selesai) AS durasi_menit,
                murid.id_murid,
                murid.nama_murid,
                murid.email AS email_murid,
                guru.id_guru,
                guru.nama_guru,
                guru.email_guru,
                materi.id_materi,
                materi.nama_materi,
                mapel.id_mapel,
                mapel.nama_mapel,
                bayar.id_pembayaran,
                bayar.biaya_sesi,        -- ✅ TAMBAHKAN INI
                bayar.biaya_jarak,       -- ✅ TAMBAHKAN INI
                bayar.metode_pembayaran,
                bayar.nominal,
                bayar.status_pembayaran,
                bayar.tanggal_pembayaran
            FROM Pemesanan p
            JOIN Murid murid ON murid.id_murid = p.id_murid
            LEFT JOIN Guru guru ON guru.id_guru = p.id_guru
            LEFT JOIN Materi materi ON materi.id_materi = p.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            LEFT JOIN Pembayaran bayar ON bayar.id_pemesanan = p.id_pemesanan
            WHERE p.id_pemesanan = ?
            LIMIT 1;
        `;

        const rows = await pool.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Detail sesi tidak ditemukan.' });

        const row = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                id_pemesanan: row.id_pemesanan,
                status_pemesanan: row.status_pemesanan,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
                lokasi_sesi: row.lokasi_sesi,
                durasi_menit: Number(row.durasi_menit),
                murid: { id_murid: row.id_murid, nama_murid: row.nama_murid, email: row.email_murid },
                guru: { id_guru: row.id_guru, nama_guru: row.nama_guru, email_guru: row.email_guru },
                mata_pelajaran: { id_mapel: row.id_mapel, nama_mapel: row.nama_mapel },
                materi: { id_materi: row.id_materi, nama_materi: row.nama_materi },
                pembayaran: {
                    id_pembayaran: row.id_pembayaran,
                    biaya_sesi: row.biaya_sesi,           // ✅ TAMBAHKAN INI
                    biaya_jarak: row.biaya_jarak,         // ✅ TAMBAHKAN INI
                    metode_pembayaran: row.metode_pembayaran,
                    nominal: row.nominal,
                    status_pembayaran: row.status_pembayaran,
                    tanggal_pembayaran: row.tanggal_pembayaran,
                },
            }
        });

    } catch (error) {
        console.error('[BankerController] Error fetching sesi detail:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil detail sesi.' });
    }
};
const getStatusPembayaran = async (req, res) => {
    const { id_pemesanan } = req.params;
    if (!id_pemesanan) return res.status(400).json({ success: false, message: 'Parameter id_pemesanan wajib diisi.' });

    try {
        const rows = await pool.query(
            `SELECT status_pembayaran FROM Pembayaran WHERE id_pemesanan = ? LIMIT 1`,
            [id_pemesanan]
        );

        const data = Array.isArray(rows[0]) ? rows[0] : Array.isArray(rows) ? rows : [rows];

        if (data.length === 0 || !data[0].status_pembayaran) {
            return res.status(200).json({ success: true, status_pembayaran: 'menunggu' });
        }

        return res.status(200).json({ success: true, status_pembayaran: data[0].status_pembayaran });

    } catch (error) {
        console.error('[BankerController] Error getStatusPembayaran:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil status pembayaran.' });
    }
};
const bayarSimulasi = async (req, res) => {
    const { id_sesi } = req.body;
    if (!id_sesi) return res.status(400).json({ success: false, message: 'Parameter id_sesi wajib diisi.' });

    try {
        const checkQuery = `
            SELECT
                p.id_pemesanan,
                p.status_pemesanan,
                bayar.id_pembayaran,
                bayar.status_pembayaran
            FROM Pemesanan p
            LEFT JOIN Pembayaran bayar ON bayar.id_pemesanan = p.id_pemesanan
            WHERE p.id_pemesanan = ?
            LIMIT 1;
        `;

        const rows = await pool.query(checkQuery, [id_sesi]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan.' });

        const sesi = rows[0];

        const updatePemesananQuery = `
            UPDATE Pemesanan
            SET status_pemesanan = 'berlangsung'
            WHERE id_pemesanan = ?;
        `;
        await pool.query(updatePemesananQuery, [id_sesi]);

        if (sesi.id_pembayaran) {
            const updatePembayaranQuery = `
                UPDATE Pembayaran
                SET status_pembayaran = 'lunas',
                    tanggal_pembayaran = CURDATE()
                WHERE id_pembayaran = ?;
            `;
            await pool.query(updatePembayaranQuery, [sesi.id_pembayaran]);
        }

        return res.status(200).json({
            success: true,
            message: 'Pembayaran berhasil dikonfirmasi.',
            data: { id_sesi, status_sekarang: 'berlangsung' }
        });

    } catch (error) {
        console.error('[BankerController] Error processing bayar simulasi:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses pembayaran.' });
    }
};

const prosesPembayaranMidtrans = async (req, res) => {
    // 1. Ambil id_sesi dan ambil juga tipe_pembayaran (va / ewallet) yang dikirim dari React Native
    const { id_sesi, tipe_pembayaran } = req.body;
    if (!id_sesi) return res.status(400).json({ success: false, message: 'Parameter id_sesi wajib diisi.' });

    try {
        const query = `
            SELECT
                p.id_pemesanan,
                bayar.nominal,
                murid.nama_murid,
                murid.email AS email_murid,
                mapel.nama_mapel
            FROM Pemesanan p
            JOIN Murid murid ON murid.id_murid = p.id_murid
            LEFT JOIN Materi materi ON materi.id_materi = p.id_materi
            LEFT JOIN MataPelajaran mapel ON mapel.id_mapel = materi.id_mapel
            LEFT JOIN Pembayaran bayar ON bayar.id_pemesanan = p.id_pemesanan
            WHERE p.id_pemesanan = ?
            LIMIT 1;
        `;

        const rows = await pool.query(query, [id_sesi]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pemesanan tidak ditemukan.' });

        const orderData = rows[0];
        const grossAmount = orderData.nominal ? Number(orderData.nominal) : 34000;

        // =========================================================================
        // ✨ SEBELAH SINI: TAMBAHKAN LOGIK UPDATE METODE PEMBAYARAN DI DATABASE ✨
        // =========================================================================
        // Menentukan string metode yang akan disimpan di database (default 'transfer bank' jika tidak dikirim)
        const dbMethod = tipe_pembayaran || 'transfer bank';

        await pool.query(
            `UPDATE Pembayaran SET metode_pembayaran = ?, status_pembayaran = 'menunggu' WHERE id_pemesanan = ?`,
            [dbMethod, id_sesi]
        );
        console.log(`[Database] Mengubah metode pembayaran Sesi ID: ${id_sesi} menjadi '${dbMethod}'`);
        // =========================================================================

        const parameter = {
            transaction_details: {
                order_id: `HUMANA-SESI-${orderData.id_pemesanan}-${Date.now()}`,
                gross_amount: grossAmount
            },
            credit_card: { secure: true },
            customer_details: {
                first_name: orderData.nama_murid || 'Murid',
                email: orderData.email_murid || 'murid@humana.com'
            },
            item_details: [{
                id: `MAPEL-${orderData.id_pemesanan}`,
                price: grossAmount,
                quantity: 1,
                name: `Sesi Privat: ${orderData.nama_mapel || 'Mata Pelajaran'}`
            }]
        };

        console.log(`[Midtrans] Minta transaksi untuk Pemesanan ID: ${id_sesi} nominal Rp${grossAmount}`);
        const transaction = await snap.createTransaction(parameter);

        return res.status(200).json({
            success: true,
            message: 'Berhasil membuat tautan pembayaran Midtrans.',
            data: {
                id_pemesanan: orderData.id_pemesanan,
                token: transaction.token,
                snap_url: transaction.redirect_url
            }
        });

    } catch (error) {
        console.error('[BankerController] Error Midtrans processing:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat menghubungkan ke Midtrans.' });
    }
}; const prosesPembayaranCod = async (req, res) => {
    const { id_sesi } = req.body;
    if (!id_sesi) return res.status(400).json({ success: false, message: 'Parameter id_sesi wajib diisi.' });

    try {
        // Update status pemesanan jadi berlangsung agar masuk ke jadwal aktif
        await pool.query(
            `UPDATE Pemesanan SET status_pemesanan = 'berlangsung' WHERE id_pemesanan = ?`,
            [id_sesi]
        );

        // Insert atau update record pembayaran
        const existingBayar = await pool.query(
            `SELECT id_pembayaran FROM Pembayaran WHERE id_pemesanan = ? LIMIT 1`,
            [id_sesi]
        );

        if (existingBayar.length > 0) {
            await pool.query(
                `UPDATE Pembayaran SET metode_pembayaran = 'cod', status_pembayaran = 'lunas', tanggal_pembayaran = CURDATE() WHERE id_pemesanan = ?`,
                [id_sesi]
            );
        } else {
            // Note: fallback insert in case payment record is missing
            await pool.query(
                `INSERT INTO Pembayaran (id_pemesanan, metode_pembayaran, nominal, status_pembayaran, tanggal_pembayaran) VALUES (?, 'cod', 34000, 'lunas', CURDATE())`,
                [id_sesi]
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Pemesanan COD berhasil dicatat.'
        });

    } catch (error) {
        console.error('[BankerController] Error COD processing:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses COD.' });
    }
};

module.exports = { getSesiDetail, bayarSimulasi, prosesPembayaranMidtrans, prosesPembayaranCod, getStatusPembayaran };


