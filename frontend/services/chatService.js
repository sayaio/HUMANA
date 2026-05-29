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

export const getChatList = async (userId, role) => {
  const response = await axios.get(`${API_URL}/chats`, {
    params: { userId, role }
  });
  return response.data?.data || [];
};