const { executeQuery } = require('../utils/dbHelper');
const cloudinary = require('../cloudinary');

const uploadDokumentasi = async (req, res) => {
    try {
        const { id_pemesanan, foto_base64 } = req.body;

        if (!id_pemesanan) {
            return res.status(400).json({ success: false, message: 'id_pemesanan diperlukan' });
        }
        if (!foto_base64) {
            return res.status(400).json({ success: false, message: 'Tidak ada foto' });
        }

        // Upload base64 langsung ke Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${foto_base64}`,
            {
                folder: 'humana/dokumentasi',
                public_id: `sesi_${id_pemesanan}_${Date.now()}`,
                resource_type: 'image',
            }
        );

        const fotoUrl = uploadResult.secure_url;

        await executeQuery(
            'UPDATE Pemesanan SET foto_dokumentasi = ? WHERE id_pemesanan = ?',
            [fotoUrl, id_pemesanan]
        );

        res.json({ success: true, foto_url: fotoUrl });
    } catch (err) {
        console.error('Error uploadDokumentasi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { uploadDokumentasi };
