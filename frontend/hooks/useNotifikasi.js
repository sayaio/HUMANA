import { useState, useCallback, useEffect } from 'react';
import { fetchNotifikasi } from '../services/notifikasiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotifikasi = (userId, role) => {
    const [unreadNotif, setUnreadNotif] = useState(false);

    const loadNotif = useCallback(async () => {
        if (!userId || !role) return;
        try {
            const resNotif = await fetchNotifikasi(role, userId);
            if (resNotif && resNotif.success && Array.isArray(resNotif.data) && resNotif.data.length > 0) {
                const maxId = Math.max(...resNotif.data.map(n => n.id_notifikasi));
                const lastRead = await AsyncStorage.getItem(`last_read_notif_${userId}`);
                if (!lastRead || maxId > parseInt(lastRead)) {
                    setUnreadNotif(true);
                } else {
                    setUnreadNotif(false);
                }
            } else {
                setUnreadNotif(false);
            }
        } catch (error) {
            setUnreadNotif(false);
        }
    }, [userId, role]);

    useEffect(() => {
        loadNotif();
    }, [loadNotif]);

    return { unreadNotif, refetchNotif: loadNotif, setUnreadNotif };
};
