const { executeQuery, fetchSingle } = require('../utils/dbHelper');

// Helper untuk menyimpan notifikasi ke pihak lawan (guru atau murid).
// targetRole menentukan kolom mana yang diisi; kolom lainnya dibiarkan NULL.
const buatNotifikasi = async (targetRole, idTarget, judul, pesan) => {
    if (!idTarget) return;
    if (targetRole === 'guru') {
        await executeQuery(
            `INSERT INTO Notifikasi (id_guru, judul, pesan) VALUES (?, ?, ?)`,
            [idTarget, judul, pesan]
        );
    } else {
        await executeQuery(
            `INSERT INTO Notifikasi (id_murid, judul, pesan) VALUES (?, ?, ?)`,
            [idTarget, judul, pesan]
        );
    }
};

const batalSesiController = async (req, res) => {
    // role berisi 'murid' atau 'guru' untuk membedakan siapa yang membatalkan
    const { id_pemesanan, role } = req.body;

    if (!id_pemesanan || !role) {
        return res.status(400).json({ success: false, message: "id_pemesanan dan role wajib diisi." });
    }

    try {
        // 1. Ambil data pemesanan + pembayaran + nama kedua pihak
        const data = await fetchSingle(`
            SELECT 
                p.id_pemesanan, p.waktu_mulai, p.status_pemesanan, p.id_guru, p.id_murid,
                m.nama_murid, g.nama_guru,
                b.status_pembayaran
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            LEFT JOIN Guru g ON p.id_guru = g.id_guru
            LEFT JOIN Pembayaran b ON p.id_pemesanan = b.id_pemesanan
            WHERE p.id_pemesanan = ?
        `, [id_pemesanan]);

        if (!data) {
            return res.status(404).json({ success: false, message: "Data pemesanan tidak ditemukan." });
        }

        const statusPembayaran = data.status_pembayaran; // 'menunggu', 'lunas', atau null
        const waktuMulai = data.waktu_mulai ? new Date(data.waktu_mulai) : null;
        const sekarang = new Date();
        const idGuru = data.id_guru;
        const idMurid = data.id_murid;
        const namaMurid = data.nama_murid || 'Murid';
        const namaGuru = data.nama_guru || 'Guru';

        // ======================================================================
        // SKENARIO A — BELUM BAYAR (pembayaran 'menunggu' / belum ada)
        // ======================================================================
        if (statusPembayaran === 'menunggu' || statusPembayaran === null) {
            if (role === 'murid') {
                // KASUS 1: Murid batal sebelum bayar -> pemesanan dihapus total.
                // Hapus pembayaran dulu karena FK Pembayaran->Pemesanan ON DELETE RESTRICT.
                await executeQuery(`DELETE FROM Pembayaran WHERE id_pemesanan = ?`, [id_pemesanan]);
                await executeQuery(`DELETE FROM Pemesanan WHERE id_pemesanan = ?`, [id_pemesanan]);

                await buatNotifikasi(
                    'guru', idGuru,
                    'Sesi Dibatalkan',
                    `${namaMurid} membatalkan sesi sebelum pembayaran. Slot Anda kembali kosong.`
                );

                return res.status(200).json({
                    success: true,
                    scenario: 'dihapus',
                    redirect: 'PesanSesi',
                    refunded: false,
                    message: "Pesanan dibatalkan. Silakan pesan sesi baru kapan saja."
                });
            }

            if (role === 'guru') {
                // KASUS 2: Guru batal sebelum dibayar -> lepas sesi ke pencarian ulang,
                // hapus pembayaran (beda guru beda harga), murid cari guru lain.
                await executeQuery(`DELETE FROM Pembayaran WHERE id_pemesanan = ?`, [id_pemesanan]);
                await executeQuery(
                    `UPDATE Pemesanan SET id_guru = NULL, status_pemesanan = 'menunggu konfirmasi' WHERE id_pemesanan = ?`,
                    [id_pemesanan]
                );

                await buatNotifikasi(
                    'murid', idMurid,
                    'Mencari Guru Lain',
                    `${namaGuru} berhalangan. Kami carikan guru lain untuk sesimu.`
                );

                return res.status(200).json({
                    success: true,
                    scenario: 'dilepas',
                    redirect: 'MencariPengajar',
                    refunded: false,
                    message: "Sesi dilepas. Murid akan dicarikan guru lain."
                });
            }
        }

        // ======================================================================
        // SKENARIO B — SUDAH BAYAR (pembayaran 'lunas')
        // ======================================================================
        if (statusPembayaran === 'lunas') {
            if (role === 'guru') {
                // KASUS 4: Guru batal sepihak -> murid full refund.
                await executeQuery(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_guru' WHERE id_pemesanan = ?`, [id_pemesanan]);
                await executeQuery(`UPDATE Pembayaran SET status_pembayaran = 'refunded' WHERE id_pemesanan = ?`, [id_pemesanan]);

                await buatNotifikasi(
                    'murid', idMurid,
                    'Sesi Dibatalkan Guru',
                    `${namaGuru} membatalkan sesi. Dana kamu dikembalikan penuh (refund).`
                );

                return res.status(200).json({
                    success: true,
                    scenario: 'dibatalkan_guru',
                    redirect: 'Activity',
                    refunded: true,
                    message: "Sesi dibatalkan guru. Dana di-refund penuh ke murid."
                });
            }

            if (role === 'murid') {
                const selisihJam = waktuMulai ? (waktuMulai - sekarang) / (1000 * 60 * 60) : 0;

                if (selisihJam > 2) {
                    // KASUS 3a: Batal > 2 jam sebelum sesi -> refund penuh.
                    await executeQuery(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_murid' WHERE id_pemesanan = ?`, [id_pemesanan]);
                    await executeQuery(`UPDATE Pembayaran SET status_pembayaran = 'refunded' WHERE id_pemesanan = ?`, [id_pemesanan]);

                    await buatNotifikasi(
                        'guru', idGuru,
                        'Sesi Dibatalkan',
                        `${namaMurid} membatalkan sesi lebih dari 2 jam sebelum mulai. Tidak ada dana masuk.`
                    );

                    return res.status(200).json({
                        success: true,
                        scenario: 'dibatalkan_murid',
                        redirect: 'Activity',
                        refunded: true,
                        penalty: false,
                        message: "Sesi dibatalkan. Dana kamu dikembalikan penuh (refund)."
                    });
                } else {
                    // KASUS 3b: Batal <= 2 jam sebelum sesi -> dana hangus (jadi kompensasi guru).
                    await executeQuery(`UPDATE Pemesanan SET status_pemesanan = 'dibatalkan_murid' WHERE id_pemesanan = ?`, [id_pemesanan]);
                    // status_pembayaran tetap 'lunas' sebagai kompensasi guru.

                    await buatNotifikasi(
                        'guru', idGuru,
                        'Sesi Dibatalkan',
                        `${namaMurid} membatalkan mendadak (< 2 jam). Dana sesi tetap menjadi hakmu.`
                    );

                    return res.status(200).json({
                        success: true,
                        scenario: 'dibatalkan_murid',
                        redirect: 'Activity',
                        refunded: false,
                        penalty: true,
                        message: "Sesi dibatalkan. Karena < 2 jam sebelum sesi, dana tidak dikembalikan."
                    });
                }
            }
        }

        return res.status(400).json({ success: false, message: "Skenario pembatalan tidak dikenali." });

    } catch (error) {
        console.error("Error di batalSesiController:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
};

module.exports = { batalSesiController };
