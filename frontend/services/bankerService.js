import { API_URL } from '../src/config';

/**
 * GET /sesi/detail/:id
 * Fetch detail ringkasan sesi sebelum bayar berdasarkan id_sesi
 */
export const getSesiDetail = async (id) => {
    try {
        const response = await fetch(`${API_URL}/sesi/detail/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log('[BankerService] Error fetching sesi detail:', error);
        return { success: false, message: error.message };
    }
};

/**
 * PUT /sesi/bayar-simulasi
 * Simulasi konfirmasi pembayaran — mengubah status sesi dari 'menunggu' menjadi 'berlangsung'
 */
export const bayarSimulasi = async (id_sesi) => {
    try {
        const response = await fetch(`${API_URL}/sesi/bayar-simulasi`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_sesi }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log('[BankerService] Error processing bayar simulasi:', error);
        return { success: false, message: error.message };
    }
};