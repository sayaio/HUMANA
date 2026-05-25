import { API_URL } from '../src/config';

export const pemesananService = {
  /**
   * Fungsi untuk mengirim data pemesanan ke server
   * @param {Object} data - Objek yang berisi id_murid, id_materi, waktu_mulai, dll.
   */
  async createPemesanan(data) {
    try {
      const response = await fetch(`${API_URL}/pemesanan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Cek apakah response sukses (status 200-299)
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan pemesanan');
      }

      return result; // Mengembalikan { success: true, id_pemesanan: '...' }
    } catch (error) {
      console.error("Service Error:", error);
      throw error; // Melempar error agar bisa ditangkap oleh UI (Alert)
    }
  }
};