import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

const ResetPasswordPage = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    if (email.trim() !== '') {
      setIsSent(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {!isSent ? (
          <>
            <Text style={styles.subtitle}>We will email you{"\n"}a link to reset your password.</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input} 
                placeholder="example@example.com" 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.envelopeIcon}>
                <Text style={{fontSize: 30}}>✉️</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              We have sent an email to <Text style={{fontWeight: 'bold'}}>{email}</Text>{"\n"}with instructions to reset your password.
            </Text>
          </>
        )}

        <TouchableOpacity 
          style={[styles.sendBtn, isSent && { marginTop: 20 }]} 
          onPress={!isSent ? handleSend : onBack}
        >
          <Text style={styles.sendBtnText}>{!isSent ? 'Send' : 'Back to Login'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing I agree with the <Text style={styles.linkText}>Terms & Conditions</Text>,{"\n"}<Text style={styles.linkText}>Privacy Policy.</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 50 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  inputContainer: { marginBottom: 30 },
  label: { fontSize: 12, color: '#333', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, height: 50, paddingHorizontal: 15, fontSize: 14 },
  sendBtn: { backgroundColor: '#387C65', borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center' }, // Warna hijau gelap
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  envelopeIcon: { width: 80, height: 80, backgroundColor: '#F0E6FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingBottom: 30, alignItems: 'center' },
  footerText: { textAlign: 'center', fontSize: 10, color: '#A9A9A9', lineHeight: 16 },
  linkText: { textDecorationLine: 'underline' }
});

export default ResetPasswordPage;