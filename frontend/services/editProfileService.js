// services/EditProfilService.js
import { API_URL } from '../src/config';

export const updateBasicProfile = async (data) => {
    const response = await fetch(`${API_URL}/profile/basic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const updateAcademicProfile = async (data) => {
    const response = await fetch(`${API_URL}/profile/academic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const updateAvailabilityProfile = async (idGuru, isActiveStatus) => {
    try {
        const response = await fetch(`${API_URL}/profile/availability`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_guru: idGuru,
                is_active: isActiveStatus
            }),
        });
        const resData = await response.json();

        return resData;

    } catch (error) {
        console.error("🔴 [SERVICE] FETCH ERROR:", error);
        return { success: false, message: error.message };
    }
};