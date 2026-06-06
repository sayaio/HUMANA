import { API_URL } from '../src/config';

/**
 * GET /history/:role/:id
 * Fetch riwayat sesi berdasarkan role (Murid/Guru) dan id nya
 */
export const getHistory = async (role, id, limit = 10, offset = 0) => {
    try {
        const response = await fetch(`${API_URL}/history/${role}/${id}?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log('[HistoryService] Error fetching history:', error);
        return { success: false, message: error.message };
    }
};

export const getActiveSchedule = async (role, id, limit = 10, offset = 0) => {
    console.log(`[Service] Memanggil URL: ${API_URL}/active/${role}/${id}?limit=${limit}&offset=${offset}`);
    try {
        const response = await fetch(`${API_URL}/active/${role}/${id}?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        // Fetch perlu di-parsing dulu ke JSON
        const result = await response.json(); 
        return result; // Kembalikan seluruh objek result { success: true, data: [...] }
    } catch (error) {
        console.log('[HistoryService] Error fetching active schedule:', error);
        return { success: false, data: [], message: error.message };
    }
};