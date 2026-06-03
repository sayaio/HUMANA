import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackIconSvg from '../components/BackIconSvg';

const { width, height } = Dimensions.get('window');

const DetailSesiAktifPage = ({ onBack, sessionData }) => {
  const [isCanceling, setIsCanceling] = useState(false);

  // ==========================================
  // PEMETAAN VARIABEL DATA DARI SESSIONDATA
  // ==========================================
  const namaMapel = sessionData?.mata_pelajaran?.nama_mapel || sessionData?.nama_mapel || 'Matematika';
  const namaMateri = sessionData?.nama_materi || sessionData?.materi?.nama_materi || 'Aljabar Dasar';
  const jenjangKelas = sessionData?.jenjang || '12 SMA – IPA';
  const lokasiAlamat = sessionData?.lokasi || sessionData?.alamat || 'Jl. Telekomunikasi No.1, Sukapura.';
  const tipeLokasi = sessionData?.tipe_lokasi || 'Sekolah';

  // --- PARSING DATA TANGGAL ---
  const formatTanggalFigma = () => {
    const rawTanggal = sessionData?.tanggal || sessionData?.waktu_mulai;
    if (!rawTanggal) return '12 Juni 2023';

    try {
      const tglOnly = rawTanggal.toString().substring(0, 10);
      const tglParts = tglOnly.split('-');
      if (tglParts.length === 3) {
        const daftarBulan = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const namaBulan = daftarBulan[parseInt(tglParts[1], 10) - 1] || tglParts[1];
        return `${parseInt(tglParts[2], 10)} ${namaBulan} ${tglParts[0]}`;
      }
    } catch (e) {
      console.log('Error parsing tanggal:', e);
    }
    return rawTanggal;
  };

  const formatWaktuFigma = () => {
    return sessionData?.waktu_string || sessionData?.waktu_sesi || '10:30 - 12:30';
  };

  const handleBatalkanPesanan = () => {
    Alert.alert(
      'Batalkan Pesanan',
      'Apakah Anda yakin ingin membatalkan jadwal pemesanan sesi kelas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: () => {
            setIsCanceling(true);
            setTimeout(() => {
              setIsCanceling(false);
              Alert.alert('Sukses', 'Pesanan sesi berhasil dibatalkan.', [
                { text: 'OK', onPress: () => onBack && onBack() }
              ]);
            }, 1000);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* FIXED NAVIGATION HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonTarget} activeOpacity={0.6}>
          <BackIconSvg size={12} color="#333333" />
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Detail Pemesanan</Text>
        <View style={{ width: width * 0.2 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBodyPadding}>
        
        {/* ROW GRID: TANGGAL & WAKTU SESI */}
        <View style={styles.metaGridRow}>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Tanggal</Text>
            <Text style={[styles.metaValueText, { color: '#4F46E5' }]}>{formatTanggalFigma()}</Text>
          </View>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Waktu Sesi</Text>
            <Text style={[styles.metaValueText, { color: '#4F46E5' }]}>{formatWaktuFigma()}</Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Jenjang</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{jenjangKelas}</Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Mata Pelajaran</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{namaMapel}</Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Materi</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{namaMateri}</Text>
          </View>
        </View>

        {/* AREA PREVIEW MAPS */}
        <View style={styles.mapsContainerWrapper}>
          <Image 
            source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=-6.9744,107.6303&zoom=15&size=600x300&markers=color:red%7C-6.9744,107.6303&key=' }}
            style={styles.mapsStaticImageMedia}
            resizeMode="cover"
          />
          <View style={styles.floatingMapBadgeRow}>
            <View style={styles.mapBadgeOptionActive}><Text style={styles.mapBadgeTextActive}>Map</Text></View>
            <View style={styles.mapBadgeOptionInactive}><Text style={styles.mapBadgeTextInactive}>Satellite</Text></View>
          </View>
          <View style={styles.floatingMapZoomControlsColumn}>
            <View style={styles.zoomBtnBox}><Text style={styles.zoomControlText}>+</Text></View>
            <View style={styles.zoomBtnBox}><Text style={styles.zoomControlText}>-</Text></View>
          </View>
          <View style={styles.floatingPegmanBox}>
            <Text style={{ fontSize: 16 }}>👤</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.locationCardRow} activeOpacity={0.8}>
          <View style={styles.locationIconMarkerCircle}>
            <Text style={{ fontSize: 16, color: '#284B7A' }}>📍</Text>
          </View>
          <View style={styles.locationTextMetaColumn}>
            <Text style={styles.locationTipeLabelText}>{tipeLokasi}</Text>
            <Text style={styles.locationFullAlamatText} numberOfLines={2}>{lokasiAlamat}</Text>
          </View>
          <Text style={styles.locationChevronRightIcon}>❯</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* PERSISTENT FOOTER: TOMBOL BATALKAN PESANAN */}
      <View style={styles.persistentFooterContainer}>
        <TouchableOpacity 
          style={styles.cancelRequestSubmitButton}
          onPress={handleBatalkanPesanan}
          disabled={isCanceling}
          activeOpacity={0.8}
        >
          {isCanceling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.innerButtonFlexRow}>
              <Text style={styles.cancelCrossIconText}>✕</Text>
              <Text style={styles.cancelButtonMainLabelText}>Batalkan Pesanan</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButtonTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.22,
  },
  backButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    marginLeft: 6,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  scrollBodyPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  metaGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaGridCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaInputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaValueText: { fontSize: 14, fontWeight: 'bold' },
  fieldBlockWrapper: { marginBottom: 16 },
  fieldSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  disabledOutlineBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledBoxValueText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  mapsContainerWrapper: {
    width: '100%',
    height: height * 0.22,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  mapsStaticImageMedia: { width: '100%', height: '100%' },
  floatingMapBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 2,
    elevation: 2,
  },
  mapBadgeOptionActive: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mapBadgeTextActive: { fontSize: 11, fontWeight: 'bold', color: '#1E40AF' },
  mapBadgeOptionInactive: { paddingHorizontal: 8, paddingVertical: 4 },
  mapBadgeTextInactive: { fontSize: 11, color: '#64748B' },
  floatingMapZoomControlsColumn: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    elevation: 2,
  },
  zoomBtnBox: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  zoomControlText: { fontSize: 16, fontWeight: 'bold', color: '#555555' },
  floatingPegmanBox: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  locationCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  locationIconMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextMetaColumn: { flex: 1, marginRight: 8 },
  locationTipeLabelText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  locationFullAlamatText: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  locationChevronRightIcon: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
  persistentFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  cancelRequestSubmitButton: {
    backgroundColor: '#E11D48',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButtonFlexRow: { flexDirection: 'row', alignItems: 'center' },
  cancelCrossIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cancelButtonMainLabelText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});

export default DetailSesiAktifPage;