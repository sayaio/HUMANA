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
    // 🛠️ Tangkap juga metode_pembayaran dari frontend (misal default: 'TUNAI')
    const { id_pemesanan, id_guru, total_pembayaran_final, biaya_sesi, biaya_jarak, metode_pembayaran } = req.body;

    if (!id_pemesanan || !id_guru || !total_pembayaran_final || biaya_sesi === undefined || biaya_jarak === undefined) {
        return res.status(400).json({ success: false, message: "Data penerimaan atau rincian biaya tidak lengkap." });
    }

    try {
        // 1. Instansiasi objek Pembayaran baru menggunakan OOP Class
        const pembayaranBaru = new Pembayaran(total_pembayaran_final, metode_pembayaran);

        await pool.query(`
            UPDATE Pemesanan 
            SET id_guru = ?, status_pemesanan = 'dikonfirmasi' 
            WHERE id_pemesanan = ?
        `, [id_guru, id_pemesanan]);

        // 2. Simpan ke DB menggunakan getter dari objek class Pembayaran
        await pool.query(`
            INSERT INTO Pembayaran (id_pemesanan, biaya_sesi, biaya_jarak, metode_pembayaran, nominal, status_pembayaran) 
            VALUES (?, ?, ?, 'menunggu', ?, 'menunggu')
        `, [
            id_pemesanan,
            biaya_sesi,
            biaya_jarak,
            pembayaranBaru.getNominal(),
        ]);

        res.status(200).json({ success: true, message: "Sesi berhasil diterima!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSesiDikonfirmasi = async (req, res) => {
    const { id_guru } = req.query;
    if (!id_guru) return res.status(400).json({ success: false, message: "ID Guru tidak disediakan." });

    try {
        const rows = await pool.query(`
            SELECT 
                p.id_pemesanan, p.waktu_mulai, p.waktu_selesai, p.lokasi_sesi, 
                m.nama_murid, mat.nama_materi,
                pem.id_pembayaran, pem.biaya_sesi, pem.biaya_jarak, pem.metode_pembayaran, pem.nominal AS harga_total, pem.status_pembayaran
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            LEFT JOIN Pembayaran pem ON p.id_pemesanan = pem.id_pemesanan
            WHERE p.id_guru = ? AND LOWER(p.status_pemesanan) = 'dikonfirmasi'
            ORDER BY p.waktu_mulai ASC LIMIT 1
        `, [id_guru]);

        if (rows.length === 0) return res.status(200).json({ success: true, data: null });

        const row = rows[0];
        const sesiDikonfirmasi = new PemesananSesi(
            row.nama_murid, id_guru, row.nama_materi,
            row.waktu_mulai, row.waktu_selesai, row.lokasi_sesi
        );
        sesiDikonfirmasi.id_pemesanan = row.id_pemesanan;

        // 3. Rekonstruksi data ke dalam objek Class Pembayaran
        const objekPembayaran = new Pembayaran(
            row.harga_total || 0,
            row.metode_pembayaran || 'menunggu',
            row.id_pembayaran,
            row.status_pembayaran || 'menunggu'
        );

        // Pasang komponen biaya di luar class pembayaran (atau bisa digabung jika class di-extend)
        sesiDikonfirmasi.biaya_belajar = row.biaya_sesi || 0;
        sesiDikonfirmasi.biaya_transport = row.biaya_jarak || 0;

        // 4. Masukkan objek class Pembayaran ke dalam properti PemesananSesi
        sesiDikonfirmasi.pembayaran = objekPembayaran.toJSON(); // otomatis memanggil metode toJSON() aman untuk dikirim

        // Format waktu string
        if (row.waktu_mulai && row.waktu_selesai) {
            const opsiJam = { hour: '2-digit', minute: '2-digit', hour12: false };
            const jamMulai = new Date(row.waktu_mulai).toLocaleTimeString('id-ID', opsiJam).replace('.', ':');
            const jamSelesai = new Date(row.waktu_selesai).toLocaleTimeString('id-ID', opsiJam).replace('.', ':');
            sesiDikonfirmasi.waktu_string = `${jamMulai} – ${jamSelesai}`;
        } else {
            sesiDikonfirmasi.waktu_string = "-";
        }

        res.status(200).json({ success: true, data: sesiDikonfirmasi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPermintaanBaru,
    terimaPermintaanSesi,
    getSesiDikonfirmasi // <-- Jangan lupa diekspor
};