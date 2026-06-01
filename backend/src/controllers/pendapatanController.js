const pool = require('../database');

const getPendapatan = async (req, res) => {
    const { id_guru } = req.params;

    try {
        const [totalResult] = await pool.query(`
            SELECT COALESCE(SUM(p.nominal), 0) AS total_pendapatan
            FROM Pembayaran p
            JOIN Pemesanan pm ON p.id_pemesanan = pm.id_pemesanan
            WHERE pm.id_guru = ?
              AND p.status_pembayaran = 'lunas'
        `, [id_guru]);

        const [bulanIniResult] = await pool.query(`
            SELECT COALESCE(SUM(p.nominal), 0) AS bulan_ini
            FROM Pembayaran p
            JOIN Pemesanan pm ON p.id_pemesanan = pm.id_pemesanan
            WHERE pm.id_guru = ?
              AND p.status_pembayaran = 'lunas'
              AND MONTH(p.tanggal_pembayaran) = MONTH(CURDATE())
              AND YEAR(p.tanggal_pembayaran) = YEAR(CURDATE())
        `, [id_guru]);

        const [sesiResult] = await pool.query(`
            SELECT COUNT(*) AS sesi_selesai
            FROM Pemesanan
            WHERE id_guru = ?
              AND status_pemesanan = 'selesai'
        `, [id_guru]);

        const riwayat = await pool.query(`
    SELECT
        pm.id_pemesanan,
        mp.nama_mapel,
        m.nama_materi,
        mu.nama_murid,
        DAYNAME(pm.waktu_mulai) AS hari,
        TIME_FORMAT(pm.waktu_mulai, '%H.%i') AS jam,
        p.nominal AS jumlah,
        p.status_pembayaran AS status
    FROM Pemesanan pm
    JOIN Pembayaran p ON pm.id_pemesanan = p.id_pemesanan
    JOIN Materi m ON pm.id_materi = m.id_materi
    JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
    JOIN Murid mu ON pm.id_murid = mu.id_murid
    WHERE pm.id_guru = ?
      AND p.status_pembayaran = 'lunas'
      AND MONTH(p.tanggal_pembayaran) = MONTH(CURDATE())
      AND YEAR(p.tanggal_pembayaran) = YEAR(CURDATE())
    ORDER BY p.tanggal_pembayaran DESC
    LIMIT 10
`, [id_guru]);

        return res.status(200).json({
            success: true,
            data: {
                total_pendapatan: Number(totalResult?.total_pendapatan) || 0,
                bulan_ini: Number(bulanIniResult?.bulan_ini) || 0,
                sesi_selesai: Number(sesiResult?.sesi_selesai) || 0,
                riwayat
            }
        });

    } catch (error) {
        console.error('[getPendapatan] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pendapatan.',
            error: error.message
        });
    }
};

const getRiwayatPendapatan = async (req, res) => {
    const { id_guru } = req.params;
    const { bulan, tahun } = req.query;

    try {
        let whereClause = `WHERE pm.id_guru = ? AND p.status_pembayaran = 'lunas'`;
        const params = [id_guru];

        if (bulan) {
            whereClause += ` AND MONTH(p.tanggal_pembayaran) = ?`;
            params.push(bulan);
        }

        if (tahun) {
            whereClause += ` AND YEAR(p.tanggal_pembayaran) = ?`;
            params.push(tahun);
        }

        const riwayat = await pool.query(`
            SELECT
                pm.id_pemesanan,
                mp.nama_mapel,
                m.nama_materi,
                mu.nama_murid,
                DAYNAME(pm.waktu_mulai) AS hari,
                TIME_FORMAT(pm.waktu_mulai, '%H.%i') AS jam,
                p.nominal AS jumlah,
                p.status_pembayaran AS status,
                p.tanggal_pembayaran
            FROM Pemesanan pm
            JOIN Pembayaran p ON pm.id_pemesanan = p.id_pemesanan
            JOIN Materi m ON pm.id_materi = m.id_materi
            JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
            JOIN Murid mu ON pm.id_murid = mu.id_murid
            ${whereClause}
            ORDER BY p.tanggal_pembayaran DESC
        `, params);

        return res.status(200).json({
            success: true,
            data: Array.isArray(riwayat) ? riwayat : [riwayat]
        });

    } catch (error) {
        console.error('[getRiwayatPendapatan] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil riwayat pendapatan.',
            error: error.message
        });
    }
};

module.exports = { getPendapatan, getRiwayatPendapatan };