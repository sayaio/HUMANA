// services/pendapatanService.js

import { API_URL } from '../src/config';

export const fetchPendapatan = async (idGuru) => {
    try {
        const response = await fetch(`${API_URL}/pendapatan/${idGuru}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[fetchPendapatan] Error:', error);
        return { success: false, message: 'Gagal mengambil data pendapatan.' };
    }
};

// services/pendapatanService.js — tambahkan fungsi baru ini

export const fetchRiwayatPendapatan = async (idGuru, bulan = null, tahun = null) => {
    try {
        let url = `${API_URL}/pendapatan/${idGuru}/riwayat`;
        
        const params = [];
        if (bulan) params.push(`bulan=${bulan}`);
        if (tahun) params.push(`tahun=${tahun}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[fetchRiwayatPendapatan] Error:', error);
        return { success: false, message: 'Gagal mengambil riwayat pendapatan.' };
    }
};