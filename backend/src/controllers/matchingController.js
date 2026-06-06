const PemesananSesi = require('../classes/PemesananSesi');
const Pembayaran = require('../classes/Pembayaran');
const pool = require('../database');
// ==========================================
// FUNGSI PEMBANTU (HELPERS)
// ==========================================
function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// ==========================================
// CONTROLLERS
// ==========================================

const getPermintaanBaru = async (req, res) => {
    const { id_guru, lat_guru, lng_guru } = req.query;

    if (!id_guru || !lat_guru || !lng_guru) {
        return res.status(400).json({
            success: false,
            message: "Koordinat lokasi terkini Guru tidak terdeteksi oleh sistem."
        });
    }
    try {
        const guruLat = Number(lat_guru);
        const guruLng = Number(lng_guru);
        // =========================================================================
        // STEP 1: CEK STATUS KEAKTIFAN GURU TERLEBIH DAHULU (PISAH DARI QUERY UTAMA)
        // =========================================================================
        const guruCheck = await pool.query(
            `SELECT is_active FROM Guru WHERE id_guru = ?`,
            [id_guru]
        );
        // Jika data guru tidak ditemukan di database
        if (guruCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Data Guru tidak ditemukan dalam sistem."
            });
        }
        const isTeacherActive = guruCheck[0].is_active;
        // KUNCI UX: Jika guru NONAKTIF (is_active === 0), langsung potong kompas di sini.
        // Kirim flag is_active: false dan data array kosong agar frontend bisa membedakan tampilannya.
        if (isTeacherActive === 0 || isTeacherActive === false) {
            return res.status(200).json({
                success: true,
                is_active: false, // Flag krusial untuk conditional rendering frontend
                message: "Status Anda saat ini sedang Nonaktif.",
                data: []
            });
        }
        // =========================================================================
        // STEP 2: JALANKAN QUERY UTAMA JIKA GURU BERSTATUS AKTIF (is_active === 1)
        // =========================================================================
        // Catatan: Klausa AND g.is_active = 1 SUDAH DIHAPUS agar tidak memicu Unknown Column error
        const rows = await pool.query(`
            SELECT 
                p.id_pemesanan, 
                p.id_murid,
                p.waktu_mulai, 
                p.waktu_selesai, 
                p.lokasi_sesi,
                m.nama_murid, 
                mat.nama_materi,
                mp.nama_mapel,
                mp.jenjang
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            JOIN MataPelajaran mp ON mat.id_mapel = mp.id_mapel
            JOIN MateriGuru mg ON p.id_materi = mg.id_materi
            WHERE p.id_guru IS NULL 
              AND mg.id_guru = ?
              AND LOWER(p.status_pemesanan) = 'menunggu konfirmasi'
            ORDER BY p.id_pemesanan DESC
        `, [id_guru]); // Menggunakan placeholder binding agar query lebih aman dan presisi
        // Pemetaan data ke class objek dan kalkulasi jarak (Tetap dipertahankan seperti aslinya)
        const daftarSesiObjek = rows.map(row => {
            const sesiPemesanan = new PemesananSesi(
                row.nama_murid,
                id_guru,
                row.nama_materi,
                row.waktu_mulai,
                row.waktu_selesai,
                row.lokasi_sesi
            );
            sesiPemesanan.id_pemesanan = row.id_pemesanan;
            // SAFETY CHECK: Jalankan kalkulasi Haversine jika lokasi berupa koordinat
            let muridLat = NaN;
            let muridLng = NaN;
            if (row.lokasi_sesi) {
                if (row.lokasi_sesi.includes('|')) {
                    const coords = row.lokasi_sesi.split('|')[0].split(',');
                    muridLat = Number(coords[0]);
                    muridLng = Number(coords[1]);
                } else if (row.lokasi_sesi.includes(',')) {
                    const coords = row.lokasi_sesi.split(',').map(Number);
                    muridLat = coords[0];
                    muridLng = coords[1];
                }
            }
            if (!isNaN(muridLat) && !isNaN(muridLng)) {
                sesiPemesanan.jarak_km = hitungJarak(guruLat, guruLng, muridLat, muridLng);
            } else {
                sesiPemesanan.jarak_km = 0;
            }
            // Lengkapi output dengan data yang tidak di-serialize oleh toJSON() class
            // (nama_mapel, jenjang, dan waktu mentah) agar halaman detail terisi penuh.
            return {
                ...sesiPemesanan.toJSON(),
                id_murid: row.id_murid,
                nama_mapel: row.nama_mapel,
                jenjang_pendidikan: row.jenjang,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
            };
        });
        // Jika guru aktif, kembalikan response sukses lengkap dengan flag is_active: true
        res.status(200).json({
            success: true,
            is_active: true,
            data: daftarSesiObjek
        });
    } catch (error) {
        console.error("Error pada getPermintaanBaruUntukGuru:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
const terimaPermintaanSesi = async (req, res) => {
    // Tambahkan biaya_sesi dan biaya_jarak pada destrukturisasi body
    const { id_pemesanan, id_guru, biaya_sesi, biaya_jarak, total_pembayaran_final } = req.body;

    if (!id_pemesanan || !id_guru || total_pembayaran_final === undefined) {
        return res.status(400).json({ success: false, message: "Data penerimaan tidak lengkap." });
    }

    try {
        await pool.query(`
            UPDATE Pemesanan 
            SET id_guru = ?, status_pemesanan = 'dikonfirmasi' 
            WHERE id_pemesanan = ?
        `, [id_guru, id_pemesanan]);

        // 2. INSERT ke tabel pembayaran dengan struktur yang lengkap
        await pool.query(`
            INSERT INTO Pembayaran (id_pemesanan, biaya_sesi, biaya_jarak, metode_pembayaran, nominal, status_pembayaran) 
            VALUES (?, ?, ?, 'menunggu', ?, 'menunggu')
        `, [id_pemesanan, biaya_sesi, biaya_jarak, total_pembayaran_final]);

        res.status(200).json({
            success: true,
            message: "Sesi berhasil diterima, tagihan pembayaran telah dibuat untuk murid."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSesiDikonfirmasi = async (req, res) => {
    const { id_guru } = req.query;

    if (!id_guru) {
        return res.status(400).json({ success: false, message: "ID Guru tidak disediakan." });
    }

    try {
        // PERBAIKAN: Jika menggunakan mysql2/promise, pastikan mengambil [rows]
        const rows = await pool.query(`
            SELECT 
                p.id_pemesanan, p.id_murid, p.waktu_mulai, p.waktu_selesai, p.lokasi_sesi, 
                m.nama_murid, mat.nama_materi,
                mp.nama_mapel, mp.jenjang,
                pem.id_pembayaran, pem.biaya_sesi, pem.biaya_jarak, pem.metode_pembayaran, 
                pem.nominal AS harga_total, pem.status_pembayaran
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            JOIN MataPelajaran mp ON mat.id_mapel = mp.id_mapel
            LEFT JOIN Pembayaran pem ON p.id_pemesanan = pem.id_pemesanan
            WHERE p.id_guru = ? AND LOWER(p.status_pemesanan) IN ('dikonfirmasi', 'berlangsung', 'menunggu pembayaran')
            ORDER BY p.waktu_mulai ASC
        `, [id_guru]);

        if (!rows || rows.length === 0) {
            return res.status(200).json({ success: true, data: [] }); // Kirim array kosong
        }

        // PERBAIKAN: Mapping semua baris menjadi list objek
        const listSesiDikonfirmasi = rows.map(row => {
            const sesi = new PemesananSesi(
                row.nama_murid, id_guru, row.nama_materi,
                row.waktu_mulai, row.waktu_selesai, row.lokasi_sesi
            );

            sesi.id_pemesanan = row.id_pemesanan;
            sesi.jarak_km = 0;

            // toJSON() menghitung ulang biaya dari tarif & jarak (jarak=0 di sini),
            // sehingga harus ditimpa dengan nilai pembayaran sebenarnya dari DB
            // agar Bayaran & Rincian (biaya_sesi + biaya_jarak = nominal) akurat.
            const biayaSesi = Number(row.biaya_sesi) || 0;
            const biayaJarak = Number(row.biaya_jarak) || 0;
            const nominalDb = Number(row.harga_total) || 0;
            // nominal (harga_total) adalah sumber utama; bila kosong/0 di DB,
            // total dihitung dari komponennya (biaya_sesi + biaya_jarak).
            const hargaTotal = nominalDb > 0 ? nominalDb : biayaSesi + biayaJarak;

            return {
                ...sesi.toJSON(),
                id_murid: row.id_murid,
                nama_mapel: row.nama_mapel,
                jenjang_pendidikan: row.jenjang,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
                biaya_sesi: biayaSesi,
                biaya_jarak: biayaJarak,
                harga_total: hargaTotal,
                status_pembayaran: row.status_pembayaran,
                metode_pembayaran: row.metode_pembayaran,
            };
        });

        res.status(200).json({ success: true, data: listSesiDikonfirmasi });
    } catch (error) {
        console.error("❌ ERROR DB getSesiDikonfirmasi:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
const selesaikanSesi = async (req, res) => {
    const { id_pemesanan } = req.body;

    if (!id_pemesanan) {
        return res.status(400).json({ success: false, message: 'id_pemesanan diperlukan.' });
    }

    try {
        await pool.query(
            `UPDATE Pemesanan SET status_pemesanan = 'selesai' WHERE id_pemesanan = ?`,
            [id_pemesanan]
        );

        // Jika metode pembayaran COD, otomatis ubah status pembayaran jadi 'lunas' dan set tanggal_pembayaran = CURDATE()
        await pool.query(
            `UPDATE Pembayaran SET status_pembayaran = 'lunas', tanggal_pembayaran = CURDATE() WHERE id_pemesanan = ? AND metode_pembayaran = 'cod'`,
            [id_pemesanan]
        );

        res.status(200).json({ success: true, message: 'Sesi berhasil diselesaikan.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = {
    getPermintaanBaru,
    terimaPermintaanSesi,
    getSesiDikonfirmasi, // <-- Jangan lupa diekspor
    selesaikanSesi
};