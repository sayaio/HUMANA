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
  RefreshControl,
  ActivityIndicator,
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
  const [refreshing, setRefreshing] = useState(false);
  const role = userRole ? userRole.toLowerCase() : 'murid';

  const loadChatData = async (isPullRefresh = false) => {
    if (!userId || !userRole) {
      if (!isPullRefresh) setLoading(false);
      return;
    }

    if (!isPullRefresh) setLoading(true);

    try {
      const jadwalAktif = await getActiveSchedules(role, userId);
      const uniqueGuru = [...new Set(jadwalAktif.map(j => j.id_guru))];

      await Promise.all(
        uniqueGuru.map(async id_guru => {
          const jadwal = jadwalAktif.find(j => j.id_guru === id_guru);
          if (!jadwal) return;
          try {
            await createChatRoom(jadwal.id_guru, jadwal.id_murid);
          } catch (e) {
            console.log(
              `[ChatPage] Gagal buat room untuk guru ${id_guru}:`,
              e?.message || e,
            );
          }
        }),
      );

      const data = await getChatList(userId, role);
      console.log('chat data:', JSON.stringify(data[0]));
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal inisialisasi chat:', error);
      setChats([]);
    } finally {
      if (!isPullRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [userId, role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChatData(true);
    setRefreshing(false);
  };

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const displayName =
        role === 'guru' ? chat?.nama_murid || '' : chat?.nama_guru || '';
      return displayName.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [chats, searchText, role]);
  const totalUnread = useMemo(() => {
    return chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
  }, [chats]);

  
  const formatWIB = (timestamp) => {
    if (!timestamp) return '';

    // Pastikan input berupa string (jika objek Date, ubah ke ISO string)
    const str = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp);

    // Ambil pola jam dan menit (HH:mm) langsung dari teksnya
    const match = str.match(/(\d{2}):(\d{2})/);
    if (!match) return '';

    let hours = parseInt(match[1], 10);
    const minutes = match[2];

    // Tambah 7 jam secara murni matematika (UTC ke WIB)
    hours = (hours + 7) % 24;

    // Gabungkan kembali dengan format titik (.) sesuai desain HUMANA
    return `${String(hours).padStart(2, '0')}.${minutes}`;
  };

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
          {/* ✅ DIUBAH: Menggunakan Image assets/mencari_icon.png pengganti emoji */}
          <Image
            source={require('../assets/mencari_icon.png')}
            style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: '#888' }}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERBARU</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#284B7A']}
              tintColor="#284B7A"
            />
          }
        >
          {loading && !refreshing ? (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#284B7A" />
              <Text style={{ marginTop: 10, color: '#999' }}>Memuat chat...</Text>
            </View>
          ) : Array.isArray(filteredChats) && filteredChats.length > 0 ? (
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
                  {/* KIRI: Avatar */}
                  <View style={[styles.avatar, { backgroundColor: '#FF9B9B' }]}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                  </View>

                  {/* KANAN: Gabungan Info & Meta dengan satu Border Bottom */}
                  <View style={styles.rightContainer}>

                    {/* Detail isi chat */}
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatName}>{displayName}</Text>
                      <Text style={styles.chatMessage} numberOfLines={1}>
                        {chat?.isi_pesan || 'Tidak ada pesan terbaru'}
                      </Text>
                    </View>

                    {/* Meta: Waktu & Badge */}
                    <View style={styles.chatMeta}>
                      <Text style={styles.chatTime}>
                        {formatWIB(chat?.timestamp)}
                      </Text>

                      {chat?.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>

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
        totalUnread={totalUnread}
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

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 14,
    marginLeft: 14,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  chatMessage: { fontSize: 13, color: '#666' },

  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 42, // Menjaga tinggi konstan agar waktu di atas dan badge di bawah tidak tabrakan
  },
  chatTime: { fontSize: 11, color: '#999' },
  unreadBadge: {
    backgroundColor: '#284B7A', // Menyelaraskan dengan tema utama HUMANA
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});
export default ChatPage;