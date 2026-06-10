import { useState, useCallback, useEffect } from 'react';
import { getMateriTerfavoritMurid, getRekomendasiMateriAcakList } from '../services/homeService';

export const useMateriRekomen = (userId, role, jenjangMurid) => {
    const [materiFavorit, setMateriFavorit] = useState(null);
    const [rekomendasiList, setRekomendasiList] = useState([]);
    const [loadingMateriRekom, setLoadingMateriRekom] = useState(false);

    const loadMateriRekom = useCallback(async () => {
        if (role !== 'murid' || !userId) return;
        setLoadingMateriRekom(true);
        try {
            const [favorit, rekomendasi] = await Promise.all([
                getMateriTerfavoritMurid(userId),
                getRekomendasiMateriAcakList(5, jenjangMurid),
            ]);
            setMateriFavorit(favorit);
            setRekomendasiList(Array.isArray(rekomendasi) ? rekomendasi : []);
        } catch (err) {
            console.error('[Hooks] Gagal muat materi rekom:', err);
            setMateriFavorit(null);
            setRekomendasiList([]);
        } finally {
            setLoadingMateriRekom(false);
        }
    }, [userId, role, jenjangMurid]);

    useEffect(() => {
        loadMateriRekom();
    }, [loadMateriRekom]);

    return { materiFavorit, rekomendasiList, loadingMateriRekom, refetchMateri: loadMateriRekom };
};
