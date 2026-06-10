const pool = require('../database');

/**
 * Helper untuk mengeksekusi query database yang mengembalikan banyak data (SELECT).
 * Fungsi ini secara otomatis menangani format kembalian array dari mysql2
 * sehingga tidak perlu lagi melakukan pengecekan `Array.isArray` berulang-ulang di controller.
 * 
 * @param {string} querySQL - SQL query
 * @param {Array} params - Array parameter binding untuk menghindari SQL Injection
 * @returns {Promise<Array>} - Array dari data hasil pencarian
 */
const fetchQuery = async (querySQL, params = []) => {
    const result = await pool.query(querySQL, params);
    return Array.isArray(result[0]) ? result[0] : (Array.isArray(result) ? result : [result]);
};

/**
 * Helper untuk mengeksekusi query database yang HANYA mengembalikan 1 baris (Single Object).
 * Berguna untuk pengecekan data spesifik (misal: get user by ID).
 * 
 * @param {string} querySQL - SQL query
 * @param {Array} params - Array parameter binding
 * @returns {Promise<Object|null>} - Objek data atau null jika tidak ada data
 */
const fetchSingle = async (querySQL, params = []) => {
    const rows = await fetchQuery(querySQL, params);
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Helper untuk mengeksekusi perintah manipulasi data (INSERT / UPDATE / DELETE).
 * Mengembalikan objek informasi (seperti insertId atau affectedRows).
 * 
 * @param {string} querySQL - SQL query
 * @param {Array} params - Array parameter binding
 * @returns {Promise<Object>} - ResultSetHeader berisi informasi hasil eksekusi
 */
const executeQuery = async (querySQL, params = []) => {
    const result = await pool.query(querySQL, params);
    // mysql2 umumnya mengembalikan struktur [ResultSetHeader, undefined] untuk query non-select
    return Array.isArray(result) ? result[0] : result;
};

module.exports = {
    fetchQuery,
    fetchSingle,
    executeQuery
};
