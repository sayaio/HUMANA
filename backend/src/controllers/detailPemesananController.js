const db = require('../database');
// Asumsi path file Class OOP yang sudah kamu buat sebelumnya
const PemesananSesi = require('../classes/PemesananSesi');
const Pembayaran = require('../classes/Pembayaran');

const getDetailPemesanan = async (req, res) => {
    const { id } = req.params;

    try {
        // PERBAIKAN MARIADB: Menghilangkan destructuring [rows] agar tidak error
        const rows = await db.query(`
            SELECT 
                p.id_pemesanan,
                p.status_pemesanan,
                p.waktu_mulai,
                p.waktu_selesai,
                p.lokasi_sesi,
                p.foto_dokumentasi,
                m.nama_materi,
                m.kelas,
                m.jurusan,
                mp.nama_mapel,
                mp.jenjang,
                b.id_pembayaran,
                b.biaya_sesi,
                b.biaya_jarak,
                b.nominal AS total_pembayaran,
                b.status_pembayaran,
                b.metode_pembayaran,
                b.tanggal_pembayaran,
                mu.nama_murid,
                gu.nama_guru
            FROM Pemesanan p
            INNER JOIN Materi m ON p.id_materi = m.id_materi
            INNER JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
            LEFT JOIN Pembayaran b ON p.id_pemesanan = b.id_pemesanan
            LEFT JOIN Murid mu ON p.id_murid = mu.id_murid
            LEFT JOIN Guru gu ON p.id_guru = gu.id_guru
            WHERE p.id_pemesanan = ?
        `, [id]);

        // Validasi data kosong pada driver MariaDB
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Detail pemesanan tidak ditemukan." });
        }

        const data = rows[0];

        // 1. Instansiasi Class PemesananSesi sesuai constructor
        // Gabungkan Mapel & Materi untuk parameter 'materi' di Class agar informatif di UI
        const materiLengkap = `${data.nama_mapel} (${data.nama_materi})`;

        const pemesananSesi = new PemesananSesi(
            data.nama_murid,
            data.nama_guru || "Mencari Guru...", // Jika id_guru masih null
            materiLengkap,
            data.waktu_mulai,
            data.waktu_selesai,
            data.lokasi_sesi
        );

        // Set properti pendukung & matching dengan properti di toJSON() milikmu
        pemesananSesi.id_pemesanan = data.id_pemesanan;
        pemesananSesi.statusPemesanan = data.status_pemesanan;
        pemesananSesi.jarak_km = data.jarak_km ? parseFloat(data.jarak_km) : 0;

        // 2. Instansiasi Class Pembayaran (jika data pembayaran sudah terbentuk di DB)
        if (data.id_pembayaran) {
            const pembayaran = new Pembayaran(
                data.id_pemesanan,
                data.biaya_sesi,
                data.biaya_jarak,
                data.total_pembayaran,
                data.metode_pembayaran
            );
            pembayaran.setId(data.id_pembayaran);
            pembayaran.setStatusBayar(data.status_pembayaran);
            pembayaran.setTanggalBayar(data.tanggal_pembayaran);

            // Hubungkan object pembayaran ke dalam object pemesananSesi
            pemesananSesi.setPembayaran(pembayaran);
        }

        // 3. Gabungkan output toJSON() dari kedua class untuk dikirim ke Frontend
        const responseData = {
            ...pemesananSesi.toJSON(),
            nama_guru: pemesananSesi.guru,
            jenjang_lengkap: `${data.kelas} ${data.jenjang} ${data.jurusan !== 'Umum' ? `- ${data.jurusan}` : ''}`,
            rincian_pembayaran: pemesananSesi.pembayaran ? pemesananSesi.pembayaran.toJSON() : null,
            foto_dokumentasi: data.foto_dokumentasi || null,
        };
        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Error di getDetailPemesanan (OOP):", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server saat mengambil detail pemesanan." });
    }
};

module.exports = { getDetailPemesanan };