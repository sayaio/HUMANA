// Asumsi kamu sudah punya module koneksi database, misalnya di import dari '../config/db'
const db = require('../database');

const batalSesiController = async (req, res) => {
    // role berisi 'murid' atau 'guru' untuk membedakan siapa yang membatalkan
    const { id_pemesanan, role } = req.body; 

    try {
        // 1. Ambil data pemesanan dan pembayaran saat ini
        const [rows] = await db.query(`
            SELECT p.waktu_mulai, p.status_pemesanan, p.id_guru, b.status_pembayaran 
            FROM Pemesanan p
            LEFT JOIN Pembayaran b ON p.id_pemesanan = b.id_pemesanan
            WHERE p.id_pemesanan = ?
        `, [id_pemesanan]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Data pemesanan tidak ditemukan." });
        }

        const data = rows[0];
        const statusPembayaran = data.status_pembayaran; // 'menunggu' atau 'lunas'
        const waktuMulai = data.waktu_mulai ? new Date(data.waktu_mulai) : null;
        const sekarang = new Date();

        // 2. LOGIKA SKENARIO BELUM BAYAR (status: menunggu)
        if (statusPembayaran === 'menunggu' || statusPembayaran === null) {
            if (role === 'murid') {
                // Murid membatalkan sebelum bayar
                await db.query(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_murid' WHERE id_pemesanan = ?`, [id_pemesanan]);
                await db.query(`UPDATE Pembayaran SET status_pembayaran = 'dibatalkan' WHERE id_pemesanan = ?`, [id_pemesanan]);
                return res.status(200).json({ message: "Pesanan berhasil dibatalkan oleh murid." });
            } 
            else if (role === 'guru') {
                // Guru membatalkan (Re-pooling) -> Kembalikan status ke menunggu konfirmasi
                await db.query(`UPDATE Pemesanan SET id_guru = NULL, status_pemesanan = 'menunggu konfirmasi' WHERE id_pemesanan = ?`, [id_pemesanan]);
                return res.status(200).json({ message: "Sesi dilepas, pesanan dikembalikan ke pencarian." });
            }
        }

        // 3. LOGIKA SKENARIO SUDAH BAYAR (status: lunas)
        if (statusPembayaran === 'lunas') {
            if (role === 'guru') {
                // Guru membatalkan sepihak -> Murid dapat refund
                await db.query(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_guru' WHERE id_pemesanan = ?`, [id_pemesanan]);
                await db.query(`UPDATE Pembayaran SET status_pembayaran = 'refunded' WHERE id_pemesanan = ?`, [id_pemesanan]);
                return res.status(200).json({ message: "Sesi dibatalkan guru. Dana di-refund ke murid." });
            } 
            else if (role === 'murid') {
                // Hitung selisih jam (Waktu Mulai - Waktu Sekarang)
                const selisihJam = (waktuMulai - sekarang) / (1000 * 60 * 60);

                if (selisihJam > 2) {
                    // Dibatalkan > 2 Jam: Bebas Penalti -> Refund
                    await db.query(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_murid' WHERE id_pemesanan = ?`, [id_pemesanan]);
                    await db.query(`UPDATE Pembayaran SET status_pembayaran = 'refunded' WHERE id_pemesanan = ?`, [id_pemesanan]);
                    return res.status(200).json({ message: "Pesanan dibatalkan. Dana di-refund karena batal > 2 jam sebelum sesi." });
                } else {
                    // Dibatalkan <= 2 Jam: Dana Hangus (status pembayaran tetap lunas)
                    await db.query(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_murid' WHERE id_pemesanan = ?`, [id_pemesanan]);
                    // Tidak ada query update pembayaran karena tetap 'lunas' sebagai kompensasi guru
                    return res.status(200).json({ message: "Pesanan dibatalkan mendadak. Sesuai kebijakan, dana hangus." });
                }
            }
        }

        return res.status(400).json({ message: "Skenario pembatalan tidak dikenali." });

    } catch (error) {
        console.error("Error di batalSesiController:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

module.exports = { batalSesiController };