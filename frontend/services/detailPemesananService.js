import { API_URL } from '../src/config';

export const fetchDetailPemesanan = async (idPemesanan) => {
    try {
        const response = await fetch(`${API_URL}/detailpemesanan/${idPemesanan}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Masukkan token bearer jika endpoint ini membutuhkan login session
                // 'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengambil detail pemesanan');
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Error memanggil API fetchDetailPemesanan:", error);
        return { success: false, message: error.message };
    }
};