import { getHistory } from './historyService';
import { fetchAllMapel, fetchMapelByJenjang, fetchMateriBySubject } from './MateriService';

const STATUS_DIBATALKAN = new Set([
  'dibatalkan',
  'dibatalkan_murid',
  'dibatalkan_guru',
]);

export const kelasAngkaKeJenjang = kelasNum => {
  const n = Number(kelasNum);
  if (Number.isNaN(n)) return { jenjang: '', kelas: '' };
  if (n <= 6) return { jenjang: 'SD', kelas: `Kelas ${n}` };
  if (n <= 9) return { jenjang: 'SMP', kelas: `Kelas ${n - 6}` };
  return { jenjang: 'SMA', kelas: `Kelas ${n - 9}` };
};

export const formatJenjangTampilan = (jenjang, jurusan) => {
  if (!jenjang) return '-';
  if (jurusan && jurusan !== 'Umum') return `${jenjang} — ${jurusan}`;
  return jenjang;
};

/** Normalisasi jenjang murid ke SD | SMP | SMA */
export const normalisasiJenjangMurid = jenjangRaw => {
  if (!jenjangRaw) return null;
  const upper = String(jenjangRaw).trim().toUpperCase();
  if (upper === 'SD' || upper === 'SMP' || upper === 'SMA') return upper;

  const angka = parseInt(String(jenjangRaw).replace(/\D/g, ''), 10);
  if (Number.isNaN(angka)) return null;
  if (angka >= 1 && angka <= 6) return 'SD';
  if (angka >= 7 && angka <= 9) return 'SMP';
  if (angka >= 10 && angka <= 12) return 'SMA';
  return null;
};

export const kelasCocokJenjang = (kelasNum, jenjang) => {
  if (!jenjang) return true;
  const n = Number(kelasNum);
  if (Number.isNaN(n)) return false;
  if (jenjang === 'SD') return n >= 1 && n <= 6;
  if (jenjang === 'SMP') return n >= 7 && n <= 9;
  if (jenjang === 'SMA') return n >= 10 && n <= 12;
  return false;
};

/**
 * Materi yang paling sering dipesan murid (dari riwayat pemesanan).
 */
export const getMateriTerfavoritMurid = async idMurid => {
  const res = await getHistory('murid', idMurid);
  if (!res?.success || !Array.isArray(res.data) || res.data.length === 0) {
    return null;
  }

  const hitung = {};

  res.data.forEach(item => {
    if (STATUS_DIBATALKAN.has(item.status_pemesanan)) return;
    const idMateri = item.materi?.id_materi;
    if (!idMateri) return;

    if (!hitung[idMateri]) {
      hitung[idMateri] = { count: 0, item };
    }
    hitung[idMateri].count += 1;
    hitung[idMateri].item = item;
  });

  const teratas = Object.values(hitung).sort((a, b) => b.count - a.count)[0];
  if (!teratas) return null;

  const row = teratas.item;
  const kelasNum = row.materi?.kelas;
  const { jenjang, kelas } = kelasAngkaKeJenjang(kelasNum);
  const namaMapel = row.mata_pelajaran?.nama_mapel || '';
  const namaMateri = row.nama_materi || '';
  const idMapel = row.mata_pelajaran?.id_mapel;

  return {
    id_materi: row.materi.id_materi,
    id_mapel: idMapel,
    nama_mapel: namaMapel,
    nama_materi: namaMateri,
    jenjang,
    kelas,
    jurusan: row.materi?.jurusan,
    jumlah_pemesanan: teratas.count,
    prefill: {
      jenjang,
      kelas,
      mataPelajaran: namaMapel,
      materi: namaMateri,
      selectedMateriId: row.materi.id_materi,
      mapelSelected:
        idMapel != null ? { id: idMapel, namaMapel: namaMapel } : null,
    },
  };
};

const buildMateriRekomendasiItem = (mapel, materiRow) => {
  const idMapel = mapel.id_mapel;
  const namaMapel = mapel.nama_mapel;

  if (!materiRow) {
    return {
      id_materi: `mapel-${idMapel}`,
      id_mapel: idMapel,
      nama_mapel: namaMapel,
      nama_materi: namaMapel,
      jenjang: '',
      kelas: '',
      jurusan: null,
      chapterData: {
        id: `mapel-${idMapel}`,
        namaMateri: namaMapel,
        deskripsiMateri: 'Belum ada deskripsi untuk materi ini.',
      },
    };
  }

  const { jenjang, kelas } = kelasAngkaKeJenjang(materiRow.kelas);
  const namaMateri = materiRow.namaMateri;

  return {
    id_materi: materiRow.id,
    id_mapel: idMapel,
    nama_mapel: namaMapel,
    nama_materi: namaMateri,
    jenjang,
    kelas,
    jurusan: materiRow.jurusan,
    chapterData: {
      id: materiRow.id,
      namaMateri: namaMateri,
      deskripsiMateri:
        materiRow.deskripsiMateri || 'Belum ada deskripsi untuk materi ini.',
    },
  };
};

/**
 * Daftar materi acak untuk section rekomendasi (default 5 item, unik).
 */
export const getRekomendasiMateriAcakList = async (jumlah = 5, jenjangMurid = null) => {
  const jenjang = normalisasiJenjangMurid(jenjangMurid);

  let mapelList = [];
  try {
    mapelList = jenjang
      ? await fetchMapelByJenjang(jenjang)
      : await fetchAllMapel();
  } catch {
    mapelList = [];
  }

  if (!Array.isArray(mapelList) || mapelList.length === 0) return [];

  const pool = [];
  const mapelAcak = [...mapelList].sort(() => Math.random() - 0.5);

  for (const mapel of mapelAcak) {
    if (pool.length >= jumlah * 4) break;

    let materiRows = [];
    try {
      materiRows = await fetchMateriBySubject(mapel.id_mapel);
    } catch {
      materiRows = [];
    }

    if (!Array.isArray(materiRows) || materiRows.length === 0) {
      continue;
    }

    materiRows
      .filter(row => kelasCocokJenjang(row.kelas, jenjang))
      .forEach(row => pool.push(buildMateriRekomendasiItem(mapel, row)));
  }

  const hasil = [];
  const seen = new Set();
  const kandidat = [...pool].sort(() => Math.random() - 0.5);

  for (const item of kandidat) {
    if (seen.has(item.id_materi)) continue;
    seen.add(item.id_materi);
    hasil.push(item);
    if (hasil.length >= jumlah) break;
  }

  return hasil;
};
