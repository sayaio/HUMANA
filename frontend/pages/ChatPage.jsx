import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  StatusBar, ScrollView, TextInput, Image 
} from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const ChatPage = ({ onNavigate, onChatPress }) => {
  // Data dummy untuk list chat
  const dummyChats = Array(6).fill({
    id: 1,
    name: 'Yanto Kurniawan',
    subject: 'Pendidikan Kewarganegaraan',
    lastMessage: 'Baik, sampai bertemu besok ya kak!',
    time: '10:11',
    unread: 1,
    initials: 'YK',
    color: '#FF9B9B' // Warna pink pudar sesuai desain
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />
      
      {/* Header Biru */}
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

      {/* Kontainer Putih List Chat */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>TERBARU</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Home')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Activity', 'aktif')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Activity</Text>
        </TouchableOpacity>
        <View style={styles.fabContainer}>
          <View style={styles.fabCutout}>
            <TouchableOpacity style={styles.fabButton}>
              <Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#284B7A' }]} resizeMode="contain" />
          <Text style={[styles.navText, { color: '#284B7A', fontWeight: 'bold' }]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Profile')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Profile</Text>
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

  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 15 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 10 },
  navIcon: { width: 22, height: 22, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'flex-start', width: 70, height: 90, top: -25 },
  fabCutout: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  fabButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#284B7A', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
  fabIcon: { width: 28, height: 28, tintColor: '#FFF' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center', marginTop: 2 },
});

export default ChatPage;