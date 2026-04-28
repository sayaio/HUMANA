import { API_URL } from '../src/config';

export const getHistory = async (role, id) => {
    try {
        const response = await fetch(`${API_URL}/history/${role}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Detail Error Fetch:", error);
        return { success: false, message: error.message };
    }
};