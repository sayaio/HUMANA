import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../src/config';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, TextInput, Image
} from 'react-native';

// Import Ikon Lucide agar seragam dengan HomePage & PageGuru
import { Calendar, MessageSquare, User, Home, Activity } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ChatPage = ({ onNavigate, onChatPress, userRole, userId }) => {
  console.log("PROPS ChatPage - userId:", userId, "| userRole:", userRole);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = userRole ? userRole.toLowerCase() : 'murid';

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !userRole) {
        setLoading(false);
        return;
      }

      try {
        // 1. Ambil jadwal aktif
        const jadwalRes = await axios.get(`${API_URL}/active/${role}/${userId}`);
        const jadwalAktif = jadwalRes.data?.data || [];
        console.log('JADWAL AKTIF:', JSON.stringify(jadwalAktif));

        // Deduplikasi: 1 guru = 1 room chat
        const uniqueGuru = [];
        const seenGuru = new Set();
        for (const jadwal of jadwalAktif) {
          if (!seenGuru.has(jadwal.id_guru)) {
            seenGuru.add(jadwal.id_guru);
            uniqueGuru.push(jadwal);
          }
        }
        // 2. Buat room chat untuk setiap jadwal aktif
        for (const jadwal of uniqueGuru) {
          if (jadwal.id_guru && jadwal.id_murid) {
            try {
              await axios.post(`${API_URL}/chats/create`, {
                id_guru: jadwal.id_guru,
                id_murid: jadwal.id_murid
              });
            } catch (e) {
              console.log(`❌ Gagal room ${jadwal.id_guru}-${jadwal.id_murid}:`, JSON.stringify(e.response?.data));
            }
          }
        }

        // 3. Baru fetch chat list
        const chatRes = await axios.get(`${API_URL}/chats`, {
          params: { userId, role }
        });
        const data = chatRes.data.data;
        setChats(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error("Gagal:", error.response?.data || error.message);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, role]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      <View style={styles.header}>
        <Image source={LOGO_SOURCE} style={styles.headerWatermark} resizeMode="contain" />
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari"
            placeholderTextColor="#A9A9A9"
          />
          <Text style={{ fontSize: 16, color: '#888' }}>🔍</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERBARU</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {Array.isArray(chats) && chats.length > 0 ? (
            chats.map((chat, index) => {
              const displayName = role === 'guru' ? (chat?.nama_murid || "Murid") : (chat?.nama_guru || "Guru");
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
                      {chat?.isi_pesan || "Tidak ada pesan terbaru"}
                    </Text>
                  </View>
                  <View style={styles.chatMeta}>
                    <Text style={styles.chatTime}>
                      {chat?.timestamp ? chat.timestamp.split(' ')[1]?.substring(0, 5) : ''}
                    </Text>
                    {chat.is_read === 0 && chat.pengirim_role !== role && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>1</Text>
                      </View>
                    )}
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
      <View style={styles.customBottomNavbar}>
        {/* BUTTON 1: BERANDA / HOME */}
        <TouchableOpacity
          style={styles.navBarItem}
          onPress={() => onNavigate(role === 'guru' ? 'HomeGuru' : 'Home')}
        >
          <Home color="#A9A9A9" size={22} />
          <Text style={styles.navBarLabel}>{role === 'guru' ? 'Home' : 'Beranda'}</Text>
        </TouchableOpacity>

        {/* BUTTON 2: AKTIVITAS / ACTIVITY */}
        <TouchableOpacity
          style={styles.navBarItem}
          onPress={() => onNavigate(role === 'guru' ? 'ActivityGuru' : 'Activity', 'aktif')}
        >
          {role === 'guru' ? (
            <Activity color="#A9A9A9" size={22} />
          ) : (
            <Calendar color="#A9A9A9" size={22} />
          )}
          <Text style={styles.navBarLabel}>{role === 'guru' ? 'Activity' : 'Aktivitas'}</Text>
        </TouchableOpacity>

        {/* BUTTON 3: CENTER FAB BUTTON (LOGO HUMANA) */}
        <View style={styles.centerFabContainer}>
          <TouchableOpacity
            style={styles.centerFabButton}
            onPress={() => onNavigate(role === 'guru' ? 'HomeGuru' : 'PesanSesi')}
          >
            <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.centerFabLabelText}>
            {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
          </Text>
        </View>

        {/* BUTTON 4: CHAT ACTIVE STATE */}
        <TouchableOpacity style={styles.navBarItem}>
          <MessageSquare color="#284B7A" size={22} />
          <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: 'bold' }]}>Chat</Text>
        </TouchableOpacity>

        {/* BUTTON 5: PROFILE */}
        <TouchableOpacity
          style={styles.navBarItem}
          onPress={() => onNavigate(role === 'guru' ? 'ProfileGuru' : 'Profile')}
        >
          <User color="#A9A9A9" size={22} />
          <Text style={styles.navBarLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },
  header: { paddingHorizontal: 20, paddingTop: 45, paddingBottom: 30, backgroundColor: '#284B7A', position: 'relative', overflow: 'hidden' },
  headerWatermark: { position: 'absolute', right: -40, top: 0, width: 200, height: 200, tintColor: '#FFF', opacity: 0.1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 15, height: 45 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#888', letterSpacing: 1, marginBottom: 15 },

  chatItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  chatInfo: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10, marginRight: 10 },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  chatMessage: { fontSize: 13, color: '#555' },
  chatMeta: { alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10, height: '100%' },
  chatTime: { fontSize: 10, color: '#888', marginBottom: 5 },
  unreadBadge: { backgroundColor: '#284B7A', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  customBottomNavbar: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF0F2', paddingHorizontal: 10 },
  navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
  centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
  centerFabButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#284B7A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
  centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
  centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },
});

export default ChatPage;