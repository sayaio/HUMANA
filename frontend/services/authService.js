import { API_URL } from '../src/config';

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Detail Error Fetch:", error);
        return { success: false, message: error.message };
    }
};
export const checkEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    return result;
  } catch (error) {
    return { exists: false };
  }
};
export const loginUserGoogle = async (email) => {
  try {
    const response = await fetch(`${API_URL}/login-google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};