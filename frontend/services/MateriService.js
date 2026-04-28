// services/materiService.js
import { API_URL } from '../src/config';

/**
 * Fetch daftar materi berdasarkan nama mata pelajaran
 * @param {string} subjectName - Nama mata pelajaran, e.g. "Matematika"
 * @returns {Promise<Array>} - Array of { id, namaMateri, kelas, deskripsiMateri }
 */
export const fetchMateriBySubject = async (subjectName) => {
  const response = await fetch(
    `${API_URL}/api/materi?subjectName=${encodeURIComponent(subjectName)}`
  );

  if (!response.ok) {
    throw new Error(`Gagal mengambil data materi: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Gagal mengambil data materi.');
  }

  return json.data; // Array of materi
};