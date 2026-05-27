import { API_URL } from '../src/config';

export const postFeedback = async (feedbackData) => {
    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error pada feedbackService:", error);
        return { success: false, message: "Gagal terhubung ke server" };
    }
};

export const fetchGuruRating = async (idGuru) => {
    try {
        const response = await fetch(`${API_URL}/profile-guru/${idGuru}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error pada fetchGuruProfile:", error);
        return { success: false, message: "Gagal memuat profil dari server" };
    }
};