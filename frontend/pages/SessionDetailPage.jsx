import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput } from 'react-native';

const SessionDetailPage = ({ onBack }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backIcon}>{'❮'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Session Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* Info Top */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}><Text style={{color: '#FFF', fontSize: 24}}>📖</Text></View>
          <View>
            <Text style={styles.title}><Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi</Text>
            <Text style={styles.subtitle}>31 FEBRUARI, 06.30 - 09.30</Text>
            <Text style={styles.subtitle}>No. Sesi: 103012400002</Text>
          </View>
        </View>

        {/* Dokumentasi */}
        <Text style={styles.sectionTitle}>Dokumentasi</Text>
        <View style={styles.imagePlaceholder}>
          <Text style={{fontSize: 60, color: '#CCC'}}>🖼️</Text>
        </View>

        {/* Biaya */}
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Biaya:</Text>
          <Text style={styles.costValue}>Rp30.000</Text>
        </View>

        <View style={styles.divider} />

        {/* Guru */}
        <Text style={styles.guruText}>👤 Ahmad Pambudi, S.Pd.</Text>

        {/* Feedback Section */}
        <TextInput 
          style={styles.feedbackInput} 
          placeholder="Masukkan Feedback..." 
          placeholderTextColor="#A9A9A9"
          multiline
          value={feedback}
          onChangeText={setFeedback}
          editable={!isSubmitted}
        />

        <Text style={styles.ratingText}>Berikan Rating Anda</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => !isSubmitted && setRating(star)} activeOpacity={isSubmitted ? 1 : 0.7}>
              <Text style={{fontSize: 35, color: star <= rating ? '#FFC107' : '#E0E0E0', marginHorizontal: 5}}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitted && styles.submitBtnDisabled]} 
          onPress={() => setIsSubmitted(true)}
          disabled={isSubmitted}
        >
          <Text style={[styles.submitBtnText, isSubmitted && styles.submitBtnTextDisabled]}>Kirim Feedback</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  iconBox: { width: 60, height: 60, backgroundColor: '#387C65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 14, color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 11, color: '#888', marginBottom: 3 },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#F0F0F0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  costLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  costValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 20 },
  guruText: { fontSize: 14, color: '#333', marginBottom: 20 },
  
  feedbackInput: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, height: 80, padding: 15, textAlignVertical: 'top', color: '#333', marginBottom: 20 },
  ratingText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  
  submitBtn: { backgroundColor: '#387C65', borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  submitBtnTextDisabled: { color: '#CCC' }
});

export default SessionDetailPage;