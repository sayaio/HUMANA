import { API_URL } from '../src/config';

export const submitFeedback = async (id_pemesanan, rating, ulasan) => {
    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pemesanan,
                rating,
                ulasan
            }),
        });
        return await response.json();
    } catch (error) {
        console.log('[FeedbackService] Error:', error);
        return { success: false, message: error.message };
    }
};