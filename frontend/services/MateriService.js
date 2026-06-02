// services/MateriService.js
import { API_URL } from '../src/config';

/**
 * Fetch daftar materi berdasarkan id mata pelajaran
 * @param {number} id_mapel - ID mata pelajaran, e.g. 1 untuk Matematika
 * @returns {Promise<Array>} - Array of { id, namaMateri, kelas, jurusan, deskripsiMateri }
 */
export const fetchMateriBySubject = async (id_mapel) => {
  const response = await fetch(`${API_URL}/materi?id_mapel=${id_mapel}`);

  if (!response.ok) {
    throw new Error(`Gagal mengambil data materi: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Gagal mengambil data materi.');
  }

  return json.data;
};

/**
 * Fetch semua mata pelajaran dari database
 * @returns {Promise<Array>} - Array of { id_mapel, nama_mapel }
 */
export const fetchAllMapel = async () => {
  const response = await fetch(`${API_URL}/mapel`);

  if (!response.ok) {
    throw new Error(`Gagal mengambil data mata pelajaran: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Gagal mengambil data mata pelajaran.');
  }

  return json.data;
};

export const simpanMateriGuru = async (idGuru, daftarIdMateri) => {
    try {
        const response = await fetch(`${API_URL}/materi/guru`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_guru: idGuru,
                daftar_id_materi: daftarIdMateri // Array of numbers, misal: [1, 2, 10]
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal menyimpan kompetensi materi');
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Error memanggil API simpanMateriGuru:", error);
        return { success: false, message: error.message };
    }
};