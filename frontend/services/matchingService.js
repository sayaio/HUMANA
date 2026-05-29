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

export const terimaPermintaanSesiAPI = async (idPemesanan, idGuru, totalPembayaranFinal, biayaSesi, biayaJarak, metodePembayaran = 'TUNAI') => {
    try {
        const response = await fetch(`${API_URL}/terima-permintaan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pemesanan: idPemesanan,
                id_guru: idGuru,
                total_pembayaran_final: totalPembayaranFinal,
                biaya_sesi: biayaSesi,
                biaya_jarak: biayaJarak
            })
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
};
export const fetchSesiDikonfirmasi = async (idGuru) => {
    try {
        // Menembak endpoint backend dengan membawa query parameter id_guru
        const response = await fetch(`${API_URL}/sesi-dikonfirmasi?id_guru=${idGuru}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        return await response.json();
    } catch (error) {
        return { success: false, message: error.message, data: null };
    }
};