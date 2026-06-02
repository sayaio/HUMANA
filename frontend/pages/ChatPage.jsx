import React, { useState, useEffect, useMemo } from 'react';
import {
  getActiveSchedules,
  createChatRoom,
  getChatList,
} from '../services/chatService';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import BottomNavbar from '../components/BottomNavbar';
// Import Ikon Lucide agar seragam dengan HomePage & PageGuru
import {
  Calendar,
  MessageSquare,
  User,
  Home,
  Activity,
} from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ChatPage = ({ onNavigate, onChatPress, userRole, userId }) => {
  console.log('PROPS ChatPage - userId:', userId, '| userRole:', userRole);
  const [chats, setChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const role = userRole ? userRole.toLowerCase() : 'murid';

  useEffect(() => {
    const initChatData = async () => {
      console.log('DEBUG SERVICE IMPORT:', {
        getActiveSchedules,
        createChatRoom,
        getChatList,
      });
      if (!userId || !userRole) {
        setLoading(false);
        return;
      }

      try {
        // 1. Ambil jadwal aktif
        const jadwalAktif = await getActiveSchedules(role, userId);

        // 2. Deduplikasi & Buat Room
        const uniqueGuru = [...new Set(jadwalAktif.map(j => j.id_guru))];

        await Promise.all(
          uniqueGuru.map(async id_guru => {
            const jadwal = jadwalAktif.find(j => j.id_guru === id_guru);
            try {
              await createChatRoom(jadwal.id_guru, jadwal.id_murid);
            } catch (e) {
              await Promise.all(
                uniqueGuru.map(async id_guru => {
                  const jadwal = jadwalAktif.find(j => j.id_guru === id_guru);
                  try {
                    await createChatRoom(jadwal.id_guru, jadwal.id_murid);
                  } catch (e) {
                    // UBAH BAGIAN INI UNTUK MELIHAT DETAIL ERROR-NYA
                    console.log(
                      `[ChatPage] Gagal buat room untuk guru ${id_guru}. Detail:`,
                      e.response?.data || e.message || e,
                    );
                  }
                }),
              );
            }
          }),
        );

        // 3. Fetch list chat
        const data = await getChatList(userId, role);
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Gagal inisialisasi chat:', error.message);
        console.error('Gagal inisialisasi chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initChatData();
  }, [userId, role]);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const displayName =
        role === 'guru' ? chat?.nama_murid || '' : chat?.nama_guru || '';
      return displayName.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [chats, searchText, role]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#284B7A"
        translucent={false}
      />

      <View style={styles.header}>
        <Image
          source={LOGO_SOURCE}
          style={styles.headerWatermark}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama..."
            placeholderTextColor="#A9A9A9"
            value={searchText} // Hubungkan ke state
            onChangeText={text => setSearchText(text)} // Update state saat mengetik
          />
          <Text style={{ fontSize: 16, color: '#888' }}>🔍</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERBARU</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {Array.isArray(filteredChats) && filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => {
              const displayName =
                role === 'guru'
                  ? chat?.nama_murid || 'Murid'
                  : chat?.nama_guru || 'Guru';
              const firstLetter = displayName.charAt(0).toUpperCase();

              return (
                <TouchableOpacity
                  key={`${chat?.id_guru}-${chat?.id_murid}`}
                  style={styles.chatItem}
                  onPress={() => onChatPress(chat)}
                >
                  <View style={[styles.avatar, { backgroundColor: '#FF9B9B' }]}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName}>{displayName}</Text>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {chat?.isi_pesan || 'Tidak ada pesan terbaru'}
                    </Text>
                  </View>
                  <View style={styles.chatMeta}>
                    <Text style={styles.chatTime}>
                      {chat?.timestamp
                        ? chat.timestamp.split(' ')[1]?.substring(0, 5)
                        : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
              Belum ada chat yang tersedia.
            </Text>
          )}
        </ScrollView>
      </View>

      {/* BOTTOM NAVBAR KONDISIONAL BERDASARKAN ROLE GURU / MURID */}
      <BottomNavbar
        currentScreen="Chat"
        onNavigate={onNavigate}
        userRole={userRole}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 30,
    backgroundColor: '#284B7A',
    position: 'relative',
    overflow: 'hidden',
  },
  headerWatermark: {
    position: 'absolute',
    right: -40,
    top: 0,
    width: 200,
    height: 200,
    tintColor: '#FFF',
    opacity: 0.1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 15,
  },

  chatItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  chatInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
    marginRight: 10,
  },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  chatMessage: { fontSize: 13, color: '#555' },
  chatMeta: {
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
    height: '100%',
  },
  chatTime: { fontSize: 10, color: '#888', marginBottom: 5 },
  unreadBadge: {
    backgroundColor: '#284B7A',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});

export default ChatPage;
