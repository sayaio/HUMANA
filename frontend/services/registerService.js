import { API_URL } from '../src/config';

/**
 * Service untuk mendaftarkan user baru (Guru/Murid)
 * @param {Object} userData - Objek berisi namaLengkap, email, password, role, dan username
 */
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();
        return result;
        
    } catch (error) {
        console.log("Detail Error Register Fetch:", error);
        return { 
            success: false, 
            message: error.message
        };
    }
};