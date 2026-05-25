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
  },
    // ← TAMBAH: fetch mapel dari DB berdasarkan jenjang
  async getDaftarMapel(jenjang) {
    const url = `${API_URL}/pemesanan/mapel${jenjang ? `?jenjang=${jenjang}` : ''}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    const result = await response.json();
    console.log('Response mapel:', JSON.stringify(result)); // ← tambah ini
    if (!response.ok) throw new Error(result.message || 'Gagal mengambil data mapel');
    return Array.isArray(result.data) ? result.data : [];
  },
    // ← TAMBAH: fetch materi dari DB berdasarkan id_mapel dan kelas
  async getDaftarMateri(id_mapel, kelas) {
    let url = `${API_URL}/pemesanan/materi?`;
    if (id_mapel) url += `id_mapel=${id_mapel}&`;
    if (kelas) url += `kelas=${kelas}`;
    console.log('Fetching materi URL:', url); // ← sementara untuk debug
    const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mengambil data materi');
    return Array.isArray(result.data) ? result.data : [];
  },
};