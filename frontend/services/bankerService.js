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

/**
 * POST /sesi/proses-midtrans  
 */
export const prosesMidtrans = async (id_sesi, tipe_pembayaran) => {
    try {
        const response = await fetch(`${API_URL}/sesi/proses-midtrans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_sesi, tipe_pembayaran }),
        });
        return await response.json();
    } catch (error) {
        console.log('[BankerService] Error processing Midtrans:', error);
        return { success: false, message: error.message };
    }
};
/**
 * POST /sesi/proses-cod 
 */
export const prosesCod = async (id_sesi) => {
    try {
        const response = await fetch(`${API_URL}/sesi/proses-cod`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_sesi }),
        });
        return await response.json();
    } catch (error) {
        console.log('[BankerService] Error processing COD:', error);
        return { success: false, message: error.message };
    }
};
/**
 * GET /sesi/status-pembayaran/:id_pemesanan
 * Cek apakah pembayaran untuk sesi ini sudah lunas
 */
export const getStatusPembayaran = async (id_pemesanan) => {
    try {
        const response = await fetch(`${API_URL}/sesi/status-pembayaran/${id_pemesanan}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('[BankerService] Error fetching status pembayaran:', error);
        return { success: false, message: error.message };
    }
};