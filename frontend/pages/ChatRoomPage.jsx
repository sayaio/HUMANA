import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  StatusBar, ScrollView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';

const ChatRoomPage = ({ chatData, onBack }) => {
  const [message, setMessage] = useState('');

  // Default nama jika data kosong
  const name = chatData?.name || 'Yanto Kurniawan';
  const subject = chatData?.subject || 'Pendidikan Kewarganegaraan';
  const initials = chatData?.initials || 'YK';
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
        <ScrollView contentContainerStyle={styles.chatArea}>
          <Text style={styles.dateSeparator}>Senin, 30 Februari 2067</Text>

          {/* Bubble User (Kanan) */}
          <View style={styles.bubbleRight}>
            <Text style={styles.textRight}>selamat siang pak.</Text>
          </View>

          {/* Bubble Lawan Bicara (Kiri) */}
          <View style={styles.bubbleLeft}>
            <Text style={styles.textLeft}>selamat siang nak.</Text>
          </View>
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
            <TouchableOpacity style={styles.sendBtn}>
              {/* Icon Send Sederhana */}
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