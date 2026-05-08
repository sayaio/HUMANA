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