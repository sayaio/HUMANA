import { API_URL } from '../src/config';

export const batalkanSesi = async (idPemesanan, role) => {
    try {
        const response = await fetch(`${API_URL}/pemesanan/batal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Tambahkan header authorization jika pakai token JWT
                // 'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                id_pemesanan: idPemesanan,
                role: role // 'murid' atau 'guru'
            }),
        });

        const result = await response.json();

        // Mengecek apakah request berhasil (status 200-299)
        if (!response.ok) {
            throw new Error(result.message || 'Gagal membatalkan sesi');
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Error memanggil API batalkanSesi:", error);
        return { success: false, message: error.message };
    }
};