import { formatTanggalIndo, formatWaktuSesi } from './formatters';

/**
 * Memetakan data sesi dari backend ke format standar bookingSessionData
 * yang digunakan oleh komponen frontend seperti PembayaranPage dan PesanSesiPage.
 * 
 * @param {Object} item - Objek sesi dari backend (biasanya list dari useActiveSessions)
 * @returns {Object} mappedSession - Objek yang sudah diformat
 */
export const mapSessionToBookingData = (item) => {
    if (!item) return null;

    // Menampilkan lokasi (setelah pemisah pipa '|' jika ada)
    const displayLokasi = item.lokasi_sesi && item.lokasi_sesi.includes('|') 
        ? item.lokasi_sesi.split('|')[1] 
        : item.lokasi_sesi;

    // Ekstrak koordinat (sebelum pemisah pipa '|' jika ada)
    let displayKoordinat = null;
    if (item.lokasi_sesi && item.lokasi_sesi.includes('|')) {
        const coords = item.lokasi_sesi.split('|')[0].split(',');
        if (coords.length === 2) {
            displayKoordinat = {
                latitude: Number(coords[0]),
                longitude: Number(coords[1])
            };
        }
    }

    return {
        id_pemesanan: item.id_pemesanan || item.id,
        id_sesi: item.id_pemesanan || item.id,
        id_murid: item.id_murid,
        id_guru: item.id_guru,
        nama_mapel: item.nama_mapel || item.mata_pelajaran,
        nama_materi: item.nama_materi || item.materi,
        jenjang: item.jenjang_pendidikan || item.jenjang,
        kelas: item.kelas_murid || item.kelas,
        lokasi: displayLokasi,
        koordinat: displayKoordinat,
        tanggal: formatTanggalIndo(item.waktu_mulai),
        waktu_sesi: formatWaktuSesi(item.waktu_mulai, item.waktu_selesai),
        biaya_sesi: item.biaya_sesi,
        biaya_jarak: item.biaya_jarak,
        nominal: item.nominal || item.harga_total || (item.biaya_sesi + (item.biaya_jarak || 0)),
        total_harga: item.nominal || item.harga_total || (item.biaya_sesi + (item.biaya_jarak || 0)),
        status_pembayaran: item.status_pembayaran
    };
};
