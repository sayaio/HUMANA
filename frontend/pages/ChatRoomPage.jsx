import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../src/config';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

const ChatRoomPage = ({ chatData, onBack, userId, userRole }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 80);
  };

  const fetchMessages = async () => {
    const { id_guru, id_murid } = chatData;
    try {
      const response = await axios.get(
        `${API_URL}/chats/messages/${id_guru}/${id_murid}?role=${userRole}`,
      );
      const data = response.data.data || response.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal ambil chat:', error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const payload = {
        id_guru: chatData.id_guru,
        id_murid: chatData.id_murid,
        pengirim_role: userRole,
        isi_pesan: message,
      };

      await axios.post(`${API_URL}/chats/send`, payload);
      setMessage('');
      await fetchMessages();
      scrollToBottom();
    } catch (error) {
      console.error('Gagal kirim chat:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (chatData?.id_chat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatData]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = e => {
      setKeyboardHeight(e.endCoordinates.height);
      scrollToBottom();
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      let dateObj;
      if (timeString instanceof Date) {
        dateObj = timeString;
      } else {
        const wStr = timeString.toString();
        const match = wStr.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
        if (match) {
          dateObj = new Date(
            parseInt(match[1], 10),
            parseInt(match[2], 10) - 1,
            parseInt(match[3], 10),
            parseInt(match[4], 10),
            parseInt(match[5], 10),
            parseInt(match[6], 10)
          );
        } else {
          dateObj = new Date(wStr);
        }
      }
      
      if (isNaN(dateObj.getTime())) return ''; // Fallback if still invalid
      
      const h = dateObj.getHours().toString().padStart(2, '0');
      const m = dateObj.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '';
    }
  };

  const name =
    userRole === 'murid'
      ? chatData?.nama_guru
      : userRole === 'guru'
        ? chatData?.nama_murid
        : 'User';
  const subject = chatData?.mapel || 'Chat';
  const initials = name.charAt(0).toUpperCase();
  const color = chatData?.color || '#FF9B9B';

  const bottomPad =
    keyboardHeight > 0
      ? Platform.OS === 'ios'
        ? 8
        : 6
      : Platform.OS === 'ios'
        ? 24
        : 16;

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#284B7A"
        translucent={true}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton onPress={onBack} label="" variant="dark" style={styles.backBtn} />

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

      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 55 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          onContentSizeChange={() => scrollToBottom(false)}
          contentContainerStyle={styles.chatArea}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.length > 0 ? (
            messages.map((item, index) => (
              <View
                key={item.id_chat || index}
                style={
                  item.pengirim_role === userRole
                    ? styles.bubbleRight
                    : styles.bubbleLeft
                }
              >
                <Text
                  style={
                    item.pengirim_role === userRole
                      ? styles.textRight
                      : styles.textLeft
                  }
                >
                  {item.isi_pesan}
                </Text>
                <Text
                  style={
                    item.pengirim_role === userRole
                      ? styles.timeRight
                      : styles.timeLeft
                  }
                >
                  {item.waktu_pesan || formatTime(item.timestamp || new Date())}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888' }}>
              Belum ada pesan.
            </Text>
          )}
        </ScrollView>

        <View style={[styles.bottomWrapper, { paddingBottom: bottomPad }]}>
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
                onFocus={scrollToBottom}
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
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#284B7A',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: { marginRight: 6, flexShrink: 0 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  headerSubject: { fontSize: 11, color: '#D0E1F9', fontStyle: 'italic' },
  menuIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  chatScroll: { flex: 1 },
  chatArea: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  bubbleRight: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end',
    marginBottom: 15,
    maxWidth: '80%',
  },
  textRight: { color: '#FFF', fontSize: 14 },
  timeRight: { color: 'rgba(255,255,255,0.7)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  bubbleLeft: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: 15,
    maxWidth: '80%',
  },
  textLeft: { color: '#000', fontSize: 14 },
  timeLeft: { color: '#888', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  bottomWrapper: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: '#FFF',
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
    height: 46,
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
