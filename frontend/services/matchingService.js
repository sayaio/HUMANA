import { API_URL } from '../src/config'; // Sesuaikan path ke config.js

export const fetchPermintaanBaru = async (idGuru, lat, lng) => {
    try {
        // Tambahkan lat_guru dan lng_guru ke URL
        const response = await fetch(`${API_URL}/permintaan-baru?id_guru=${idGuru}&lat_guru=${lat}&lng_guru=${lng}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        return await response.json();
    } catch (error) {
        return { success: false, message: error.message, data: [] };
    }
};