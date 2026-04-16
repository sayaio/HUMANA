import { API_URL } from '../src/config';
import { Alert } from 'react-native';

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
            return result;
        }
    } catch (error) {
        console.log("Detail Error:", error);
        Alert.alert('Error', error.message); 
        return { success: false, message: error.message };
    }
};