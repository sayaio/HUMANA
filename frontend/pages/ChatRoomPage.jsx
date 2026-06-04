import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../src/config';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import BackIconSvg from '../components/BackIconSvg'; // <-- Sesuaikan dengan path foldermu
const ChatRoomPage = ({ chatData, onBack, userId, userRole }) => {
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const { id_guru, id_murid } = chatData;
    try {
      const response = await axios.get(`${API_URL}/chats/messages/${id_guru}/${id_murid}`);
      const data = response.data.data || response.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil chat:", error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const payload = {
        id_guru: chatData.id_guru,
        id_murid: chatData.id_murid,
        pengirim_role: userRole,
        isi_pesan: message
      };

      await axios.post(`${API_URL}/chats/send`, payload);
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Gagal kirim chat:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (chatData?.id_chat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatData]);

  const name = userRole === "murid" ? chatData?.nama_guru : (userRole === "guru" ? chatData?.nama_murid : 'User');
  const subject = chatData?.mapel || 'Chat';
  const initials = name.charAt(0).toUpperCase();
  const color = chatData?.color || '#FF9B9B';

  return (
    // Menggunakan View biasa sebagai root container agar warna background-nya konsisten terpotong rapi
    <View style={styles.rootContainer}>
      {/* Paksa status bar mengikuti warna header dan berikan paduan padding di atas header */}
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={true} />

      {/* Header Biru dengan tambahan aman dari Notch */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <BackIconSvg size={16} color="#FFF" />
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

      {/* Area Konten */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.chatArea}
        >
          {messages.length > 0 ? (
            messages.map((item, index) => (
              <View
                key={item.id_chat || index}
                style={item.pengirim_role === userRole ? styles.bubbleRight : styles.bubbleLeft}
              >
                <Text style={item.pengirim_role === userRole ? styles.textRight : styles.textLeft}>
                  {item.isi_pesan}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888' }}>Belum ada pesan.</Text>
          )}
        </ScrollView>

        {/* Input Bottom Bar yang dibungkus container pengaman bawah */}
        <View style={styles.bottomWrapper}>
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
                <Image
                  source={require('../assets/send.png')}
                  style={styles.sendIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },

  // FIX ATAS (NOTCH): Ditambahkan paddingTop manual menggunakan tinggi status bar standar Android/iOS
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#284B7A',
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 40 : 40,
  },
  backBtn: { padding: 5, marginRight: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  headerSubject: { fontSize: 11, color: '#D0E1F9', fontStyle: 'italic' },
  menuIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold', paddingHorizontal: 10 },

  chatArea: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },

  bubbleRight: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, borderBottomRightRadius: 2, alignSelf: 'flex-end', marginBottom: 15, maxWidth: '80%' },
  textRight: { color: '#FFF', fontSize: 14 },

  bubbleLeft: { backgroundColor: '#E5E5EA', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, borderBottomLeftRadius: 2, alignSelf: 'flex-start', marginBottom: 15, maxWidth: '80%' },
  textLeft: { color: '#000', fontSize: 14 },

  // FIX BAWAH (MEPET): Mengunci area bawah agar berjarak aman dengan sistem navigasi handphone
  bottomWrapper: {
    backgroundColor: '#FFF',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16, // Memberi jarak dari navigasi bar bawah ponsel modern
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10, // Menggeser padding atas ke sini
    backgroundColor: '#FFF'
  },
  plusBtn: { marginRight: 10 },
  plusIcon: { fontSize: 24, color: '#333' },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingLeft: 15,
    height: 46
  },
  textInput: { flex: 1, fontSize: 14, color: '#333' },
  sendBtn: { marginLeft: 10 },
  sendIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default ChatRoomPage;