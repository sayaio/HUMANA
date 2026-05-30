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
                p.waktu_mulai, 
                p.waktu_selesai, 
                p.lokasi_sesi,
                m.nama_murid, 
                mat.nama_materi
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            JOIN MateriGuru mg ON p.id_materi = mg.id_materi
            WHERE p.id_guru IS NULL 
              AND mg.id_guru = ?
              AND LOWER(p.status_pemesanan) = 'menunggu konfirmasi'
            ORDER BY p.waktu_mulai ASC
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
            if (row.lokasi_sesi && row.lokasi_sesi.includes(',')) {
                const [muridLat, muridLng] = row.lokasi_sesi.split(',').map(Number);
                if (!isNaN(muridLat) && !isNaN(muridLng)) {
                    sesiPemesanan.jarak_km = hitungJarak(guruLat, guruLng, muridLat, muridLng);
                } else {
                    sesiPemesanan.jarak_km = 0;
                }
            } else {
                sesiPemesanan.jarak_km = 0;
            }
            return sesiPemesanan;
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
                p.id_pemesanan, p.waktu_mulai, p.waktu_selesai, p.lokasi_sesi, 
                m.nama_murid, mat.nama_materi,
                pem.id_pembayaran, pem.biaya_sesi, pem.biaya_jarak, pem.metode_pembayaran, 
                pem.nominal AS harga_total, pem.status_pembayaran
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            LEFT JOIN Pembayaran pem ON p.id_pemesanan = pem.id_pemesanan
            WHERE p.id_guru = ? AND LOWER(p.status_pemesanan) = 'dikonfirmasi'
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
            sesi.harga_total = row.harga_total || 0; // Pastikan properti ini dibaca di toJSON nanti

            // Format waktu
            if (row.waktu_mulai && row.waktu_selesai) {
                const opsiJam = { hour: '2-digit', minute: '2-digit', hour12: false };
                const jamMulai = new Date(row.waktu_mulai).toLocaleTimeString('id-ID', opsiJam).replace('.', ':');
                const jamSelesai = new Date(row.waktu_selesai).toLocaleTimeString('id-ID', opsiJam).replace('.', ':');
                sesi.waktu_string = `${jamMulai} – ${jamSelesai}`;
            } else {
                sesi.waktu_string = "-";
            }

            return sesi;
        });

        res.status(200).json({ success: true, data: listSesiDikonfirmasi });
    } catch (error) {
        console.error("❌ ERROR DB getSesiDikonfirmasi:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = {
    getPermintaanBaru,
    terimaPermintaanSesi,
    getSesiDikonfirmasi // <-- Jangan lupa diekspor
};