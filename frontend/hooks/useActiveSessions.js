import { useState, useCallback, useEffect } from 'react';
import { getActiveSchedule } from '../services/historyService';

export const useActiveSessions = (userId, userRole) => {
    const [activeSessions, setActiveSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const loadActiveSessions = useCallback(async () => {
        if (!userId || !userRole || userRole === '-') return;
        setLoadingSessions(true);
        try {
            const result = await getActiveSchedule(userRole, userId);
            if (result?.success) {
                let raw = result.data;
                if (!Array.isArray(raw)) raw = [raw];
                
                const today = new Date();
                raw = raw.filter(sesi => {
                    const tglRaw = sesi.waktu_mulai || sesi.jam_mulai;
                    if (!tglRaw) return false;
                    const tgl = new Date(tglRaw);
                    return (
                        tgl.getDate() === today.getDate() &&
                        tgl.getMonth() === today.getMonth() &&
                        tgl.getFullYear() === today.getFullYear()
                    );
                });

                setActiveSessions(raw);
            } else {
                setActiveSessions([]);
            }
        } catch {
            setActiveSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, [userId, userRole]);

    useEffect(() => {
        loadActiveSessions();
    }, [loadActiveSessions]);

    return { activeSessions, loadingSessions, refetchSessions: loadActiveSessions };
};
