import { API_URL } from '../src/config';

export const materiGuruService = {

  // GET — ambil materi yang sudah dipilih guru
  async getMateriGuru(idGuru) {
    const response = await fetch(`${API_URL}/materi-guru/${idGuru}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mengambil data materi guru.');
    return Array.isArray(result.data) ? result.data : [];
  },

  // GET — ambil semua materi (digroup by mapel+kelas)
  async getAllMateri() {
    const response = await fetch(`${API_URL}/semua-materi`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mengambil semua materi.');
    return Array.isArray(result.data) ? result.data : [];
  },

  // POST — simpan materi terpilih (batch)
  async simpanMateriGuru(idGuru, idMateriList) {
    const response = await fetch(`${API_URL}/materi-guru`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id_guru: idGuru, id_materi_list: idMateriList }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal menyimpan materi.');
    return result;
  },

  // DELETE — hapus satu materi guru
  async hapusMateriGuru(idGuru, idMateri) {
    const response = await fetch(`${API_URL}/materi-guru/${idGuru}/${idMateri}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal menghapus materi.');
    return result;
  },
};