const pool = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads/dokumentasi ada
const uploadDir = path.join(__dirname, '../../uploads/dokumentasi');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan foto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `sesi_${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file JPG/PNG yang diizinkan'));
        }
    },
});

const uploadDokumentasi = async (req, res) => {
    console.log('=== REQUEST MASUK ===');
    try {
        const { id_pemesanan, foto_base64, foto_name } = req.body;

        if (!foto_base64) {
            return res.status(400).json({ success: false, message: 'Tidak ada foto' });
        }
        if (!id_pemesanan) {
            return res.status(400).json({ success: false, message: 'id_pemesanan diperlukan' });
        }

        // Simpan base64 ke file
        const buffer = Buffer.from(foto_base64, 'base64');
        const filename = `sesi_${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);

        const fotoPath = `/uploads/dokumentasi/${filename}`;

        const conn = await pool.getConnection();
        await conn.query(
            'UPDATE Pemesanan SET foto_dokumentasi = ? WHERE id_pemesanan = ?',
            [fotoPath, id_pemesanan]
        );
        conn.release();

        res.json({ success: true, foto_url: fotoPath });
    } catch (err) {
        console.log('Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { upload, uploadDokumentasi };
