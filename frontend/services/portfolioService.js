import { API_URL } from '../src/config';

export const portfolioService = {

  // GET — ambil semua portfolio milik guru
  async getPortfolioByGuru(idGuru) {
    const response = await fetch(`${API_URL}/portfolio/${idGuru}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mengambil data portofolio.');
    return Array.isArray(result.data) ? result.data : [];
  },

  // POST — tambah portfolio baru
  async tambahPortfolio(data) {
    const response = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal menambahkan portofolio.');
    return result;
  },

  // DELETE — hapus portfolio
  async hapusPortfolio(idPortfolio) {
    const response = await fetch(`${API_URL}/portfolio/${idPortfolio}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal menghapus portofolio.');
    return result;
  },

};