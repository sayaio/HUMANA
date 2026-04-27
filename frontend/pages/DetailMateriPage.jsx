import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  StatusBar, ScrollView 
} from 'react-native';

const DetailMateriPage = ({ chapterName, onBack }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2A3563" translucent={false} />
      
      {/* Header Navy */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chapterName}</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      {/* Kontainer Putih (Melengkung di atas) */}
      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 50 }}>
          <Text style={styles.sectionTitle}>Deskripsi Materi</Text>
          
          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>

          <Text style={styles.paragraph}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
          </Text>
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
  
  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15 }, // Warna hijau
  paragraph: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 15, textAlign: 'justify' }
});

export default DetailMateriPage;