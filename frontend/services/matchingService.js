import { API_URL } from '../src/config'; // Sesuaikan path ke config.js

export const fetchPermintaanBaru = async (idGuru) => {
    try {
        // Kirim idGuru sebagai query parameter
        const response = await fetch(`${API_URL}/permintaan-baru?id_guru=${idGuru}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Detail Error Fetch Matching:", error);
        return { success: false, message: error.message, data: [] };
    }
};