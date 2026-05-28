const pool = require('../database');

// 1. Controller untuk mengambil materi (Sudah di-JOIN dengan MataPelajaran)
const getMateriDropdown = async (req, res) => {
    try {
        const { id_mapel, mapel, kelas } = req.query;

        let querySQL = `
      SELECT 
        m.id_materi, 
        m.nama_materi, 
        m.kelas, 
        m.jurusan,
        m.id_mapel,
        mp.nama_mapel,
        mp.jenjang
      FROM Materi m
      LEFT JOIN MataPelajaran mp ON m.id_mapel = mp.id_mapel
      WHERE 1=1
    `;
        const params = [];

        if (id_mapel) {
            querySQL += ` AND m.id_mapel = ?`;
            params.push(id_mapel);
        } else if (mapel) {
            querySQL += ` AND mp.nama_mapel = ?`;
            params.push(mapel);
        }

        if (kelas) {
            querySQL += ` AND m.kelas = ?`;
            params.push(kelas);
        }

        const result = await pool.query(querySQL, params); // ← hapus destructuring [rows]

        // Ambil array dari result
        const rows = Array.isArray(result[0]) ? result[0] :
            Array.isArray(result) ? result : [result];

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error pada getMateriDropdown:", error);
        res.status(500).json({ success: false, message: error.message, data: [] });
    }
};

// 2. Controller mengambil Mapel berdasarkan Jenjang
const getMapelByJenjang = async (req, res) => {
    try {
        const { jenjang } = req.query;

        let query = "SELECT id_mapel AS id, nama_mapel AS namaMapel, jenjang FROM MataPelajaran";
        let params = [];

        if (jenjang) {
            query += " WHERE jenjang = ?";
            params.push(jenjang);
        }

        const result = await pool.query(query, params); // ← hapus destructuring [rows]
        console.log('Raw result:', result); // ← tambah sementara

        // Ambil array dari result
        const rows = Array.isArray(result[0]) ? result[0] :
            Array.isArray(result) ? result : [result];

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Controller untuk menyimpan pemesanan baru
const tambahPemesanan = async (req, res) => {
    console.log("Data diterima:", req.body);
    const { id_murid, id_materi, waktu_mulai, waktu_selesai, lokasi_sesi } = req.body;

    if (!id_murid || !id_materi || !waktu_mulai || !waktu_selesai || !lokasi_sesi) {
        return res.status(400).json({ success: false, message: 'Harap melengkapi seluruh form pemesanan.' });
    }

    try {
        const querySQL = `
            INSERT INTO Pemesanan 
            (id_murid, id_guru, id_materi, status_pemesanan, waktu_mulai, waktu_selesai, lokasi_sesi) 
            VALUES (?, null, ?, 'menunggu konfirmasi', ?, ?, ?)
        `;

        const result = await pool.query(querySQL, [id_murid, id_materi, waktu_mulai, waktu_selesai, lokasi_sesi]);

        let insertedId = result[0]?.insertId || result.insertId || null;
        const safeId = insertedId !== null ? insertedId.toString() : null;

        res.status(201).json({
            success: true,
            message: 'Pemesanan sesi berhasil disimpan!',
            id_pemesanan: safeId
        });

    } catch (error) {
        console.error("Error pada saat Insert Pemesanan:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data pemesanan ke database.' });
    }
};

const cekStatusPemesananMurid = async (req, res) => {
    const { id_pemesanan } = req.query;

    if (!id_pemesanan) {
        return res.status(400).json({ success: false, message: "ID Pemesanan tidak disertakan." });
    }

    try {
        const result = await pool.query(`
            SELECT 
                p.id_pemesanan, 
                p.status_pemesanan,
                p.id_guru,
                g.nama_guru
            FROM Pemesanan p
            LEFT JOIN Guru g ON p.id_guru = g.id_guru
            WHERE p.id_pemesanan = ?
        `, [id_pemesanan]);

        // Proteksi format array dari driver pool mysql
        const rows = Array.isArray(result[0]) ? result[0] : (Array.isArray(result) ? result : [result]);

        console.log("=== [DEBUG BACKEND] Rows Terdeteksi ===", rows);

        if (!rows || rows.length === 0) {
            return res.status(204).json({ success: false, message: "Pesanan tidak ditemukan." });
        }

        const pesanan = rows[0];

        res.status(200).json({
            success: true,
            status_pemesanan: pesanan.status_pemesanan,
            data_guru: pesanan.id_guru ? { id_guru: pesanan.id_guru, nama_guru: pesanan.nama_guru } : null
        });

    } catch (error) {
        console.error("Error pada cekStatusPemesananMurid:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    getMateriDropdown,
    tambahPemesanan,
    getMapelByJenjang,
    cekStatusPemesananMurid
};