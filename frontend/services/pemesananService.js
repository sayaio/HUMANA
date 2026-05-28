import { API_URL } from '../src/config';

export const pemesananService = {
    /**
     * Mengirim data pemesanan baru ke server
     * @param {Object} data - { id_murid, id_materi, waktu_mulai, waktu_selesai, lokasi_sesi }
     */
    async createPemesanan(data) {
        try {
            const response = await fetch(`${API_URL}/pemesanan/tambah`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Gagal menyimpan pemesanan');
            }
            return result; // Mengembalikan { success: true, id_pemesanan: '...' }
        } catch (error) {
            console.error("Service Error (createPemesanan):", error);
            throw error;
        }
    },

    /**
     * Mengambil daftar mata pelajaran berdasarkan jenjang
     */
    async getDaftarMapel(jenjang) {
        try {
            const url = `${API_URL}/pemesanan/mapel${jenjang ? `?jenjang=${jenjang}` : ''}`;
            const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Gagal mengambil data mapel');
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error("Service Error (getDaftarMapel):", error);
            throw error;
        }
    },

    /**
     * Mengambil daftar materi berdasarkan ID Mapel dan Kelas
     */
    async getDaftarMateri(id_mapel, kelas) {
        try {
            let url = `${API_URL}/pemesanan/materi?`;
            if (id_mapel) url += `id_mapel=${id_mapel}&`;
            if (kelas) url += `kelas=${kelas}`;

            const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Gagal mengambil data materi');
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error("Service Error (getDaftarMateri):", error);
            throw error;
        }
    },

    /**
     * Mengecek status pemesanan (Polling)
     */
    async cekStatusPemesanan(id_pemesanan) {
        try {
            const url = `${API_URL}/pemesanan/cek-status?id_pemesanan=${id_pemesanan}`;
            const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Gagal memeriksa status pemesanan');
            return result;
        } catch (error) {
            console.error("Service Error (cekStatusPemesanan):", error);
            throw error;
        }
    }
};