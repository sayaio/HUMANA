import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../src/config';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';

const ChatRoomPage = ({ chatData, onBack, userId, userRole }) => {
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State untuk menampung chat dari DB

  // Fungsi ambil chat dari API
  const fetchMessages = async () => {
    const { id_guru, id_murid } = chatData;

    // Pastikan kita membersihkan URL dari duplikasi /api/
    // Jika API_URL Anda sudah ada /api, jangan tambahkan /api lagi
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace('/api', '') : API_URL;
    const url = `${baseUrl}/api/chats/messages/${id_guru}/${id_murid}`;

    try {
      const response = await axios.get(url);
      setMessages(response.data);
    } catch (error) {
      console.error("Gagal ambil chat dari URL:", url, error);
    }
  };
  // Fungsi kirim chat
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const payload = {
        id_chat: chatData.id_chat,
        pengirim_id: userId,
        isi_pesan: message
      };

      await axios.post(`${API_URL}/chats/send`, payload);
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Gagal kirim chat:", error);
    }
  };
  useEffect(() => {
    // Tambahkan ini untuk memastikan ID benar-benar terkirim
    console.log("ChatRoomPage menerima chatData:", chatData);

    if (chatData?.id_chat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    } else {
      console.error("ID Chat Kosong! Periksa pengiriman data dari ChatPage");
    }
  }, [chatData]);
  const name = chatData?.nama_guru || chatData?.nama_murid || 'User';
  const subject = chatData?.mapel || 'Chat';
  const initials = name.charAt(0).toUpperCase();

  // Menggunakan warna default jika tidak ada di database
  const color = chatData?.color || '#FF9B9B';
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      {/* Header Biru */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>

        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerSubject}>{subject}</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Area Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.chatArea}
        >
          {messages.length > 0 ? (
            messages.map((item, index) => (
              <View
                key={item.id_pesan || index}
                style={item.pengirim_id === userId ? styles.bubbleRight : styles.bubbleLeft}
              >
                <Text style={item.pengirim_id === userId ? styles.textRight : styles.textLeft}>
                  {item.isi_pesan}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888' }}>Belum ada pesan.</Text>
          )}
        </ScrollView>
        {/* Input Bottom Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusBtn}>
            <Text style={styles.plusIcon}>⊕</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Tuliskan Pesan..."
              placeholderTextColor="#A9A9A9"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendIcon}>➢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#284B7A', paddingHorizontal: 15, paddingVertical: 15 },
  backBtn: { padding: 5, marginRight: 10 },
  backIcon: { fontSize: 22, color: '#FFF', fontWeight: 'bold' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  headerSubject: { fontSize: 11, color: '#D0E1F9', fontStyle: 'italic' },
  menuIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold', paddingHorizontal: 10 },

  chatArea: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  dateSeparator: { alignSelf: 'center', fontSize: 12, color: '#888', marginBottom: 20 },

  bubbleRight: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, borderBottomRightRadius: 2, alignSelf: 'flex-end', marginBottom: 15, maxWidth: '80%' },
  textRight: { color: '#FFF', fontSize: 14 },

  bubbleLeft: { backgroundColor: '#E5E5EA', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, borderBottomLeftRadius: 2, alignSelf: 'flex-start', marginBottom: 15, maxWidth: '80%' },
  textLeft: { color: '#000', fontSize: 14 },

  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFF' },
  plusBtn: { marginRight: 10 },
  plusIcon: { fontSize: 24, color: '#333' },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FC', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  textInput: { flex: 1, fontSize: 14, color: '#333' },
  sendBtn: { marginLeft: 10 },
  sendIcon: { fontSize: 20, color: '#000', transform: [{ rotate: '-45deg' }] }
});

export default ChatRoomPage;