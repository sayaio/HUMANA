import { API_URL } from '../src/config';
export const uploadDokumentasi = async (id_pemesanan, fotoUri, fotoBase64) => {
    try {
        console.log('=== UPLOAD BASE64 ===');
        const response = await fetch(`${API_URL}/dokumentasi/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pemesanan: String(id_pemesanan),
                foto_base64: fotoBase64,
                foto_name: `dokumentasi_${id_pemesanan}.jpg`,
            }),
        });
        const result = await response.json();
        console.log('Result:', result);
        return result;
    } catch (error) {
        console.log('Error:', error.message);
        return { success: false, message: error.message };
    }
};

export const getDokumentasi = async (id_pemesanan) => {
    try {
        const response = await fetch(`${API_URL}/detailpemesanan/${id_pemesanan}`);
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
};