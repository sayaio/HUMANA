import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, StatusBar, ScrollView, TextInput, Image 
} from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); // Dummy Icon

const MateriPage = ({ subjectName, onBack, onChapterSelect }) => {
  // Dummy data bab materi
  const dummyChapters = [
    { id: 1, title: 'Aljabar Linear' },
    { id: 2, title: 'Geometri Ruang' },
    { id: 3, title: 'Trigonometri Dasar' },
    { id: 4, title: 'Statistika' },
    { id: 5, title: 'Kalkulus Lanjut' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A3563" translucent={false} />
      
      {/* Header Navy */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectName}</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      {/* Kontainer Putih (Melengkung di atas) */}
      <View style={styles.contentContainer}>
        
        {/* Header Filter & Judul */}
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}><Text style={{fontWeight: 'bold'}}>Materi</Text></Text>
          {/* Dummy Filter Icon */}
          <Text style={{fontSize: 18, color: '#666'}}>▼</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Cari Materi" 
            placeholderTextColor="#A9A9A9"
          />
          <Text style={{fontSize: 16, color: '#A9A9A9'}}>🔍</Text>
        </View>

        {/* List Materi */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          {dummyChapters.map((chapter) => (
            <View key={chapter.id} style={styles.card}>
              <View style={styles.cardIconBox}>
                <Image source={LOGO_SOURCE} style={styles.cardIcon} resizeMode="contain" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{chapter.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.lihatBtn}
                onPress={() => onChapterSelect(chapter.title)}
              >
                <Text style={styles.lihatBtnText}>Lihat</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2A3563' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  
  contentContainer: { flex: 1, backgroundColor: '#FAFAFA', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 25 },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  contentTitle: { fontSize: 18, color: '#333' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  searchInput: { flex: 1, height: '100%', color: '#333' },
  
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3 },
  cardIconBox: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardIcon: { width: 35, height: 35, tintColor: '#333' },
  cardTextContainer: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 3 },
  cardSubtitle: { fontSize: 11, color: '#888', lineHeight: 14 },
  
  lihatBtn: { backgroundColor: '#D0E1F9', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  lihatBtnText: { color: '#2A3563', fontSize: 12, fontWeight: 'bold' }
});

export default MateriPage;