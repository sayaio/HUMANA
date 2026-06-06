// src/services/chatService.js
import axios from 'axios';
import { API_URL } from '../src/config';

console.log("chatService loaded - axios:", typeof axios, "| API_URL:", API_URL);

export const getActiveSchedules = async (role, userId) => {
  const response = await axios.get(`${API_URL}/active/${role}/${userId}`);
  return response.data?.data || [];
};

export const createChatRoom = async (id_guru, id_murid) => {
  return await axios.post(`${API_URL}/chats/create`, { id_guru, id_murid });
};

export const getChatList = async (userId, role, limit = 10, offset = 0) => {
  const response = await axios.get(`${API_URL}/chats`, {
    params: { userId, role, limit, offset }
  });
  return response.data?.data || [];
};

/**
 * Tambahan Baru: Ambil semua pesan sekaligus otomatis markAsRead di backend
 * @param {number} id_guru 
 * @param {number} id_murid 
 * @param {string} role - Role pembaca ('guru' atau 'murid')
 */
export const getMessages = async (id_guru, id_murid, role) => {
  // Catatan: Sesuaikan path '/chats/messages' jika route Express kamu berbeda
  const response = await axios.get(`${API_URL}/chats/messages/${id_guru}/${id_murid}`, {
    params: { role } // Ini akan otomatis menjadi ?role=guru atau ?role=murid di URL
  });
  return response.data;
};