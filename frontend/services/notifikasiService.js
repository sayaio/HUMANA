import { API_URL } from '../src/config';

// Ambil daftar notifikasi milik user (guru/murid).
export const fetchNotifikasi = async (role, id, limit = 20, offset = 0) => {
    try {
        const response = await fetch(`${API_URL}/notifikasi/${role}/${id}?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal mengambil notifikasi');
        return result;
    } catch (error) {
        console.error('[notifikasiService] fetchNotifikasi error:', error);
        return { success: false, message: error.message, data: [] };
    }
};

