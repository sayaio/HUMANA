import { API_URL } from '../src/config';

// Ambil daftar notifikasi milik user (guru/murid).
export const fetchNotifikasi = async (role, id) => {
    try {
        const response = await fetch(`${API_URL}/notifikasi/${role}/${id}`, {
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

// Hapus semua notifikasi user setelah ditampilkan.
export const clearNotifikasi = async (role, id) => {
    try {
        const response = await fetch(`${API_URL}/notifikasi/${role}/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal menghapus notifikasi');
        return result;
    } catch (error) {
        console.error('[notifikasiService] clearNotifikasi error:', error);
        return { success: false, message: error.message };
    }
};
