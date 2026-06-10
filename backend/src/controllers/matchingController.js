const PemesananSesi = require('../classes/PemesananSesi');
const { fetchQuery, fetchSingle, executeQuery } = require('../utils/dbHelper');

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
        const guruCheck = await fetchSingle(
            `SELECT is_active FROM Guru WHERE id_guru = ?`,
            [id_guru]
        );
        // Jika data guru tidak ditemukan di database
        if (!guruCheck) {
            return res.status(404).json({
                success: false,
                message: "Data Guru tidak ditemukan dalam sistem."
            });
        }
        const isTeacherActive = guruCheck.is_active;
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
        const rows = await fetchQuery(`
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
        `, [id_guru]); 
        
        // Pemetaan data ke class objek dan kalkulasi jarak 
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
            
            return {
                ...sesiPemesanan.toJSON(),
                id_murid: row.id_murid,
                nama_mapel: row.nama_mapel,
                jenjang_pendidikan: row.jenjang,
                waktu_mulai: row.waktu_mulai,
                waktu_selesai: row.waktu_selesai,
            };
        });
        
        res.status(200).json({
            success: true,
            is_active: true,
            data: daftarSesiObjek
        });
    } catch (error) {
        console.error("Error pada getPermintaanBaru:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const terimaPermintaanSesi = async (req, res) => {
    const { id_pemesanan, id_guru, biaya_sesi, biaya_jarak, total_pembayaran_final } = req.body;

    if (!id_pemesanan || !id_guru || total_pembayaran_final === undefined) {
        return res.status(400).json({ success: false, message: "Data penerimaan tidak lengkap." });
    }
    
    try {
        await executeQuery(`
            UPDATE Pemesanan 
            SET id_guru = ?, status_pemesanan = 'dikonfirmasi' 
            WHERE id_pemesanan = ?
        `, [id_guru, id_pemesanan]);

        await executeQuery(`
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
        const rows = await fetchQuery(`
            SELECT 
                p.id_pemesanan, p.status_pemesanan, p.id_murid, p.waktu_mulai, p.waktu_selesai, p.lokasi_sesi, 
                m.nama_murid, mat.nama_materi,
                mp.nama_mapel, mp.jenjang,
                pem.id_pembayaran, pem.biaya_sesi, pem.biaya_jarak, pem.metode_pembayaran, 
                pem.nominal AS harga_total, pem.status_pembayaran
            FROM Pemesanan p
            JOIN Murid m ON p.id_murid = m.id_murid
            JOIN Materi mat ON p.id_materi = mat.id_materi
            JOIN MataPelajaran mp ON mat.id_mapel = mp.id_mapel
            LEFT JOIN Pembayaran pem ON p.id_pemesanan = pem.id_pemesanan
            WHERE p.id_guru = ? AND LOWER(p.status_pemesanan) IN ('dikonfirmasi', 'berlangsung')
            ORDER BY p.waktu_mulai ASC
        `, [id_guru]);

        if (!rows || rows.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const listSesiDikonfirmasi = rows.map(row => {
            const sesi = new PemesananSesi(
                row.nama_murid, id_guru, row.nama_materi,
                row.waktu_mulai, row.waktu_selesai, row.lokasi_sesi
            );

            sesi.id_pemesanan = row.id_pemesanan;
            sesi.statusPemesanan = row.status_pemesanan; 
            sesi.jarak_km = 0;

            const biayaSesi = Number(row.biaya_sesi) || 0;
            const biayaJarak = Number(row.biaya_jarak) || 0;
            const nominalDb = Number(row.harga_total) || 0;
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
        await executeQuery(
            `UPDATE Pemesanan SET status_pemesanan = 'selesai' WHERE id_pemesanan = ?`,
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
    getSesiDikonfirmasi, 
    selesaikanSesi
};