const pool = require('../database');
const admin = require('firebase-admin');
const { randomUUID } = require('crypto');
const path = require('path');

// Inisialisasi Firebase Admin sekali saja (reuse jika sudah ada instance lain)
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '../config/firebase-service-account.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

const bucket = admin.storage().bucket();

const uploadDokumentasi = async (req, res) => {
    const { id_pemesanan, foto_base64 } = req.body;

    if (!foto_base64) {
        return res.status(400).json({ success: false, message: 'Tidak ada foto' });
    }
    if (!id_pemesanan) {
        return res.status(400).json({ success: false, message: 'id_pemesanan diperlukan' });
    }

    let conn;
    try {
        const buffer = Buffer.from(foto_base64, 'base64');
        const filePath = `dokumentasi/sesi_${id_pemesanan}_${Date.now()}.jpg`;
        const downloadToken = randomUUID();
        const file = bucket.file(filePath);

        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpeg',
                metadata: { firebaseStorageDownloadTokens: downloadToken },
            },
        });

        // URL publik permanen bergaya Firebase (bisa diakses dari device mana pun)
        const fotoUrl =
            `https://firebasestorage.googleapis.com/v0/b/${bucket.name}` +
            `/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

        conn = await pool.getConnection();
        await conn.query(
            'UPDATE Pemesanan SET foto_dokumentasi = ? WHERE id_pemesanan = ?',
            [fotoUrl, id_pemesanan]
        );

        res.json({ success: true, foto_url: fotoUrl });
    } catch (err) {
        console.error('Upload dokumentasi gagal:', err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { uploadDokumentasi };
