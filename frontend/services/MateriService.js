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

/**
 * Fetch mata pelajaran per jenjang (SD / SMP / SMA) — Metode A: GET /pemesanan/mapel
 * @param {string} jenjang - Wajib: 'SD' | 'SMP' | 'SMA'
 * @returns {Promise<Array<{ id_mapel: number, nama_mapel: string, jenjang: string }>>}
 */
export const fetchMapelByJenjang = async jenjang => {
  if (!jenjang || typeof jenjang !== 'string' || !jenjang.trim()) {
    throw new Error('Parameter jenjang wajib diisi (SD, SMP, atau SMA).');
  }

  const response = await fetch(
    `${API_URL}/pemesanan/mapel?jenjang=${encodeURIComponent(jenjang.trim())}`,
  );

  if (!response.ok) {
    throw new Error(`Gagal mengambil mapel jenjang: ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || 'Gagal mengambil mata pelajaran.');
  }

  if (!Array.isArray(json.data)) {
    throw new Error('Format data mata pelajaran tidak valid.');
  }

  return json.data.map((row, index) => {
    const id_mapel = row.id_mapel ?? row.id;
    const nama_mapel = row.nama_mapel ?? row.namaMapel;
    const jenjangRow = row.jenjang ?? jenjang.trim();

    if (id_mapel == null || !nama_mapel) {
      throw new Error(
        `Data mata pelajaran tidak lengkap pada indeks ${index}.`,
      );
    }

    return {
      id_mapel: Number(id_mapel),
      nama_mapel: String(nama_mapel),
      jenjang: String(jenjangRow),
    };
  });
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