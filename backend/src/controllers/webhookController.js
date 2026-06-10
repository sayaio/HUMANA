// src/controllers/webhookController.js
const { executeQuery } = require('../utils/dbHelper');

const handleMidtrans = async (req, res) => {
    try {
        const notification = req.body;
        console.log("Notifikasi Midtrans Masuk:", notification);

        const orderIdString = notification.order_id; // Contoh: 'HUMANA-SESI-11-1780028969962'
        const transactionStatus = notification.transaction_status;

        // 1. Ambil ID Pemesanan asli (angka 11) dari string order_id
        const parts = orderIdString.split('-');
        const idPemesanan = parts[2]; // Mengambil indeks ke-2, yaitu '11'

        console.log(`Mengolah status pembayaran untuk id_pemesanan: ${idPemesanan} dengan status transaksi: ${transactionStatus}`);

        // 2. Tentukan status teks (huruf kecil menyesuaikan enum/data di HeidiSQL kamu)
        let statusBaru = '';
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            statusBaru = 'lunas';
        } else if (transactionStatus === 'pending') {
            statusBaru = 'menunggu';
        } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
            statusBaru = 'gagal'; // Sesuaikan jika kelompokmu punya term sendiri untuk transaksi gagal
        }

        // 3. Eksekusi UPDATE langsung ke tabel Pembayaran menggunakan pool
        if (statusBaru) {
            // Mengupdate tabel Pembayaran berdasarkan kolom id_pemesanan
            const queryText = 'UPDATE Pembayaran SET status_pembayaran = ? WHERE id_pemesanan = ?';
            await executeQuery(queryText, [statusBaru, idPemesanan]);

            console.log(`[Database Sync] Berhasil mengupdate tabel Pembayaran untuk id_pemesanan ${idPemesanan} menjadi '${statusBaru}'`);
        }

        // 4. Kirim respon balik ke Midtrans
        return res.status(200).json({
            status: 'success',
            message: 'Webhook processed and Pembayaran table updated successfully'
        });

    } catch (error) {
        console.error("Error saat memproses Webhook Midtrans:", error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

module.exports = {
    handleMidtrans
};