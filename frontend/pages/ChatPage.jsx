import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  StatusBar, ScrollView, TextInput, Image 
} from 'react-native';

// Import Ikon Lucide agar seragam dengan HomePage
import { Calendar, MessageSquare, User, Home } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const ChatPage = ({ onNavigate, onChatPress, userRole }) => {
  const role = userRole ? userRole.toLowerCase() : 'murid';

  const dummyChats = Array(6).fill({
    id: 1,
    name: 'Yanto Kurniawan',
    subject: 'Pendidikan Kewarganegaraan',
    lastMessage: 'Baik, sampai bertemu besok ya kak!',
    time: '10:11',
    unread: 1,
    initials: 'YK',
    color: '#FF9B9B'
  });

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
          <Text style={{fontSize: 16, color: '#888'}}>🔍</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERBARU</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {dummyChats.map((chat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.chatItem} 
              onPress={() => onChatPress(chat)}
            >
              <View style={[styles.avatar, { backgroundColor: chat.color }]}>
                <Text style={styles.avatarText}>{chat.initials}</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatSubject}>{chat.subject}</Text>
                <Text style={styles.chatMessage} numberOfLines={1}>{chat.lastMessage}</Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={styles.chatTime}>{chat.time}</Text>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SAMAKAN BOTTOM NAVBAR DENGAN HOMEPAGE */}
      <View style={styles.customBottomNavbar}>
        <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate('Home')}>
          <Home color="#A9A9A9" size={22} />
          <Text style={styles.navBarLabel}>{role === 'guru' ? 'Home' : 'Beranda'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate('Activity', 'aktif')}>
          <Calendar color="#A9A9A9" size={22} />
          <Text style={styles.navBarLabel}>{role === 'guru' ? 'Activity' : 'Aktivitas'}</Text>
        </TouchableOpacity>

        <View style={styles.centerFabContainer}>
          <TouchableOpacity 
            style={styles.centerFabButton}
            onPress={() => {
              if (onNavigate) {
                onNavigate(role === 'guru' ? 'Activity' : 'PesanSesi');
              }
            }}
          >
            <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.centerFabLabelText}>
            {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
          </Text>
        </View>

        <TouchableOpacity style={styles.navBarItem}>
          <MessageSquare color="#284B7A" size={22} />
          <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: 'bold' }]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate('Profile')}>
          <User color="#A9A9A9" size={22} />
          <Text style={styles.navBarLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, backgroundColor: '#284B7A', position: 'relative', overflow: 'hidden' },
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
  chatSubject: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 3 },
  chatMessage: { fontSize: 13, color: '#555' },
  chatMeta: { alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10, height: '100%' },
  chatTime: { fontSize: 10, color: '#888', marginBottom: 5 },
  unreadBadge: { backgroundColor: '#284B7A', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  // STYLE SINKRONISASI HOMEPAGE NAVBAR
  customBottomNavbar: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF0F2', paddingHorizontal: 10 },
  navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
  centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
  centerFabButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#284B7A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
  centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
  centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },
});

export default ChatPage;