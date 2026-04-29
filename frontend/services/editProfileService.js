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