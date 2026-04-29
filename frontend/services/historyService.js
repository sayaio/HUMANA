import { API_URL } from '../src/config';

/**
 * GET /history/:role/:id
 * Fetch riwayat sesi berdasarkan role (Murid/Guru) dan id nya
 */
export const getHistory = async (role, id) => {
    try {
        const response = await fetch(`${API_URL}/history/${role}/${id}`, {
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