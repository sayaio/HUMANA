/**
 * Format angka menjadi format Rupiah (Rp 0)
 * @param {number|string} angka 
 * @returns {string} string berformat Rupiah
 */
export const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + parseInt(angka, 10).toLocaleString('id-ID');
};

/**
 * Parsing tanggal mentah menjadi Date object yang aman
 * @param {any} raw 
 * @returns {Date|null}
 */
export const safeParseDate = (raw) => {
    if (!raw) return null;
    const d = new Date(raw instanceof Date ? raw : raw.toString().replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Format tanggal menjadi format Indonesia (Contoh: 12 Januari 2026)
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export const formatTanggalIndo = (dateStr) => {
    if (!dateStr) return '';
    const date = safeParseDate(dateStr);
    if (!date) return '-';
    
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Format waktu menjadi HH:MM
 * @param {string|Date} raw 
 * @returns {string}
 */
export const formatJamMenit = (raw) => {
    const d = safeParseDate(raw);
    if (!d) return '--:--';
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Format rentang waktu sesi (Contoh: 14:00 - 15:30)
 * @param {string|Date} waktuMulai 
 * @param {string|Date} waktuSelesai 
 * @returns {string}
 */
export const formatWaktuSesi = (waktuMulai, waktuSelesai) => {
    if (!waktuMulai || !waktuSelesai) return '-';
    const mulai = formatJamMenit(waktuMulai);
    const selesai = formatJamMenit(waktuSelesai);
    if (mulai === '--:--' || selesai === '--:--') return '-';
    return `${mulai} - ${selesai}`;
};
