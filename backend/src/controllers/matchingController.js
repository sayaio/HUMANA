const PemesananSesi = require('../classes/PemesananSesi');
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

        const rows = await pool.query(`
            SELECT 
                p.id_pemesanan, 
                p.waktu_mulai, 
                p.waktu_selesai, 
                p.lokasi_sesi, -- Ini menampung teks nama jalan seperti 'Jl. AWOKAOWK'
                m.nama_murid, 
                mat.nama_materi
            FROM pemesanan p
            JOIN murid m ON p.id_murid = m.id_murid
            JOIN materi mat ON p.id_materi = mat.id_materi
            WHERE p.id_guru IS NULL 
              AND LOWER(p.status_pemesanan) = 'menunggu konfirmasi'
            ORDER BY p.waktu_mulai ASC
        `);

        const daftarSesiObjek = rows.map(row => {
            const sesiPemesanan = new PemesananSesi(
                row.nama_murid,
                id_guru,
                row.nama_materi,
                row.waktu_mulai,
                row.waktu_selesai,
                row.lokasi_sesi // Alamat string dilempar dengan aman ke constructor class
            );
            sesiPemesanan.id_pemesanan = row.id_pemesanan;

            // SAFETU CHECK: Lakukan bypass kalkulasi jarak jika lokasi_sesi bukan koordinat GPS
            if (row.lokasi_sesi && row.lokasi_sesi.includes(',')) {
                const [muridLat, muridLng] = row.lokasi_sesi.split(',').map(Number);

                // Cek apakah hasil splitting valid menghasilkan angka, bukan NaN
                if (!isNaN(muridLat) && !isNaN(muridLng)) {
                    sesiPemesanan.jarak_km = hitungJarak(guruLat, guruLng, muridLat, muridLng);
                } else {
                    sesiPemesanan.jarak_km = 0; // fallback jika bukan angka koordinat
                }
            } else {
                sesiPemesanan.jarak_km = 0; // fallback jika isinya murni teks seperti 'Jl. AWOKAOWK'
            }

            return sesiPemesanan;
        });

        res.status(200).json({ success: true, data: daftarSesiObjek });

    } catch (error) {
        console.error("Error pada getPermintaanBaruUntukGuru:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
const terimaPermintaanSesi = async (req, res) => {
    const { id_pemesanan, id_guru, total_pembayaran_final } = req.body;

    if (!id_pemesanan || !id_guru || !total_pembayaran_final) {
        return res.status(400).json({ success: false, message: "Data penerimaan tidak lengkap." });
    }

    try {
        // 1. Update status pemesanan dan isi id_guru yang menerima
        await pool.query(`
            UPDATE pemesanan 
            SET id_guru = ?, status_pemesanan = 'dikonfirmasi' 
            WHERE id_pemesanan = ?
        `, [id_guru, id_pemesanan]);

        // 2. INSERT ke tabel pembayaran (Nama kolom diganti dari id_sesi menjadi id_pemesanan)
        await pool.query(`
            INSERT INTO pembayaran (id_pemesanan, metode_pembayaran, nominal, status_pembayaran) 
            VALUES (?, 'menunggu', ?, 'menunggu')
        `, [id_pemesanan, total_pembayaran_final]);

        res.status(200).json({
            success: true,
            message: "Sesi berhasil diterima, tagihan pembayaran telah dibuat untuk murid."
        });
    } catch (error) {
        console.error("Error pada terimaPermintaanSesi:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPermintaanBaru,
    terimaPermintaanSesi
};