import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  Calendar,
  BookOpen,
  Wallet,
  MousePointerClick,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Import services
import {
  fetchPermintaanBaru,
  terimaPermintaanSesiAPI,
  fetchSesiDikonfirmasi,
} from '../services/matchingService';
import { fetchAllMapel } from '../services/MateriService';
import BottomNavbar from '../components/BottomNavbar';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const SUBJECT_ICONS = {
  Matematika: require('../assets/matematika.png'),
  Informatika: require('../assets/informatika.png'),
  Biologi: require('../assets/biologi.png'),
  Kimia: require('../assets/kimia.png'),
  Fisika: require('../assets/fisika.png'),
  Sejarah: require('../assets/sejarah.png'),
  Sosiologi: require('../assets/sosiologi.png'),
  'Bahasa Inggris': require('../assets/inggris.png'),
};

const FONTS = {
  bold: 'SF-Pro-Display-Bold',
  regular: 'SF-Pro-Display-Regular',
};

const PageGuru = ({ guruData, onNavigate, onSelectSubject }) => {
  const { width: windowWidth } = useWindowDimensions();

  const [permintaan, setPermintaan] = useState([]);
  const [sesiDikonfirmasi, setSesiDikonfirmasi] = useState([]);
  const [loading, setLoading] = useState(true);

  const LAT_GURU_MOCK = -6.9744;
  const LNG_GURU_MOCK = 107.6303;

  const loadPermintaan = async () => {
    if (!guruData || !guruData.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const resultReq = await fetchPermintaanBaru(
      guruData.id,
      LAT_GURU_MOCK,
      LNG_GURU_MOCK,
    );
    if (resultReq && resultReq.success) {
      setPermintaan(resultReq.data);
    } else {
      setPermintaan([]);
    }

    const resultSesi = await fetchSesiDikonfirmasi(guruData.id);
    if (resultSesi && resultSesi.success && resultSesi.data) {
      const raw = resultSesi.data;
      setSesiDikonfirmasi(Array.isArray(raw) ? raw : raw ? [raw] : []);
    } else {
      setSesiDikonfirmasi([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPermintaan();
  }, [guruData]);

  // ✅ DIUBAH: tambah try/catch/finally + requestAnimationFrame
  const handleTerimaSesi = async item => {
    Alert.alert(
      'Konfirmasi Terima',
      `Apakah Anda yakin ingin menerima permintaan mengajar dari ${item.nama_murid}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terima',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await terimaPermintaanSesiAPI(
                item.id_pemesanan,
                guruData.id,
                item.biaya_sesi,
                item.biaya_jarak,
                item.harga_total,
              );
              if (res && res.success) {
                requestAnimationFrame(() => {
                  Alert.alert('Sukses', 'Sesi berhasil dikonfirmasi!');
                });
                loadPermintaan();
              } else {
                requestAnimationFrame(() => {
                  Alert.alert('Gagal', res.message || 'Terjadi kesalahan sistem.');
                });
              }
            } catch (e) {
              requestAnimationFrame(() => {
                Alert.alert('Error', 'Terjadi masalah jaringan.');
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ✅ DIUBAH: pesan lebih ringkas, konsisten dengan halaman lain
  const handleTolakSesi = item => {
    Alert.alert(
      'Tolak Permintaan',
      `Abaikan permintaan dari ${item.nama_murid}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: () => {
            setPermintaan(prev =>
              prev.filter(p => p.id_pemesanan !== item.id_pemesanan),
            );
          },
        },
      ],
    );
  };

  const formatRupiah = number => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // States & Bottom sheet untuk fitur list mata pelajaran
  const [isMateriVisible, setIsMateriVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));
  const [allSubjects, setAllSubjects] = useState([]);
  const [loadingMapel, setLoadingMapel] = useState(false);

  useEffect(() => {
    if (isMateriVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isMateriVisible]);

  const closeMateriSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsMateriVisible(false));
  };

  const panResponder = useState(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideAnim.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          closeMateriSheet();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  )[0];

  useEffect(() => {
    if (!isMateriVisible) return;
    const load = async () => {
      setLoadingMapel(true);
      try {
        const data = await fetchAllMapel();
        setAllSubjects(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        console.error('[PageGuru] Gagal fetch mapel:', err);
      } finally {
        setLoadingMapel(false);
      }
    };
    load();
  }, [isMateriVisible]);

  const renderSubjectItem = subject => {
    const icon = SUBJECT_ICONS[subject.nama_mapel] || LOGO_SOURCE;
    return (
      <TouchableOpacity
        key={subject.id_mapel || Math.random()}
        style={styles.subjectItemContainer}
        onPress={() => {
          closeMateriSheet();
          if (onSelectSubject)
            onSelectSubject({
              id_mapel: subject.id_mapel,
              subjectName: subject.nama_mapel,
            });
        }}
      >
        <View style={styles.subjectIconBox}>
          <Image
            source={icon}
            style={styles.subjectIconImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subjectItemText}>{subject.nama_mapel}</Text>
      </TouchableOpacity>
    );
  };

  const renderSessionItem = ({ item }) => {
    return (
      <View style={styles.sessionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>SESI HARI INI</Text>
          <View style={styles.badgeSegera}>
            <Text style={styles.badgeTextSegera}>• Segera</Text>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item.nama_murid
                ? item.nama_murid.substring(0, 2).toUpperCase()
                : 'SR'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.nama_murid || 'Nama Murid'}
            </Text>
            <Text style={styles.subjectText} numberOfLines={1}>
              {item.nama_materi || 'Mata Pelajaran'}
            </Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.gridCol2}>
            <Text style={styles.detailLabel}>Waktu</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.waktu_string || 'Sesi Terjadwal'}
            </Text>
          </View>
          <View style={styles.gridCol2}>
            <Text style={styles.detailLabel}>Bayaran</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formatRupiah(item.harga_total)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSessionCard = () => {
    if (loading) {
      return (
        <View style={[styles.sessionCardPlaceholder, styles.centerContent]}>
          <ActivityIndicator size="small" color="#284B7A" />
          <Text style={styles.loadingText}>Mencari sesi hari ini...</Text>
        </View>
      );
    }

    if (!sesiDikonfirmasi || sesiDikonfirmasi.length === 0) {
      return (
        <View
          style={[
            styles.sessionCardPlaceholder,
            styles.centerContent,
            { paddingVertical: 40 },
          ]}
        >
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🏖️</Text>
          <Text
            style={{
              fontSize: 14,
              color: '#999',
              fontFamily: FONTS.regular,
              textAlign: 'center',
            }}
          >
            Tidak ada sesi mengajar hari ini.
          </Text>
        </View>
      );
    }

    const SIDE_PADDING = 20;
    const cardWidth = windowWidth - 40;
    const gapSize = 12;

    return (
      <Animated.FlatList
        data={sesiDikonfirmasi}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginRight: gapSize }}>
            {renderSessionItem({ item })}
          </View>
        )}
        keyExtractor={(item, index) =>
          item.id_pemesanan?.toString() || index.toString()
        }
        horizontal
        pagingEnabled={false}
        snapToInterval={cardWidth + gapSize}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING,
          paddingVertical: 4,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBackground}>
          <Text style={styles.welcomeText}>Halo,</Text>
          <Text style={styles.nameText}>{guruData?.name || 'Guru'}!</Text>
        </View>

        {/* CONTAINER CAROUSEL SLIDER SESI DIKONFIRMASI */}
        <View style={{ marginTop: -50 }}>{renderSessionCard()}</View>

        {/* GRID MENU BUTTONS DENGAN ICON ASSET GAMBAR BARU */}
        <View style={styles.menuGridContainer}>
          <View style={styles.menuRow}>
            <TouchableOpacity
              style={styles.menuItemButton}
              onPress={() => onNavigate && onNavigate('ActivityGuru')}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../assets/kalender.png')}
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuButtonText}>Jadwal Saya</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItemButton}
              onPress={() => setIsMateriVisible(true)}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../assets/materi.png')}
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuButtonText}>Materi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItemButton}
              onPress={() => onNavigate && onNavigate('Pendapatan')}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../assets/pendapatan.png')}
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuButtonText}>Pendapatan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItemButton}
              onPress={() => onNavigate && onNavigate('ActivityGuru')}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={require('../assets/permintaan.png')}
                  style={styles.menuIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.menuButtonText}>Permintaan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION: PERMINTAAN BARU */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>PERMINTAAN BARU</Text>
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('ActivityGuru')}
          >
            <Text style={styles.linkText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#284B7A"
            style={{ marginTop: 30 }}
          />
        ) : permintaan.length === 0 ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: '#888', fontFamily: FONTS.regular }}>
              Belum ada permintaan mengajar saat ini.
            </Text>
          </View>
        ) : (
          permintaan.slice(0, 2).map(item => (
            <View key={item.id_pemesanan} style={styles.requestCard}>
              <View style={styles.profileRowRequest}>
                <View
                  style={[
                    styles.avatarCircleRequest,
                    { backgroundColor: '#284B7A' },
                  ]}
                >
                  <Text style={styles.avatarTextRequest}>
                    {item.nama_murid
                      ? item.nama_murid.substring(0, 2).toUpperCase()
                      : 'SN'}
                  </Text>
                </View>
                <View style={styles.profileInfoRequest}>
                  <Text style={styles.studentNameRequest}>
                    {item.nama_murid}
                  </Text>
                  <Text style={styles.subjectTextRequest}>
                    {item.nama_materi}
                  </Text>
                </View>
                <View style={styles.badgeBaru}>
                  <Text style={styles.badgeTextBaru}>• Baru</Text>
                </View>
              </View>

              <View style={styles.detailGridRequest}>
                <View style={styles.detailItemRequest}>
                  <Text style={styles.detailLabelRequest}>Waktu</Text>
                  <Text style={styles.detailValueRequest}>
                    {item.waktu_string}
                  </Text>
                </View>
                <View style={styles.detailItemRequest}>
                  <Text style={styles.detailLabelRequest}>Lokasi</Text>
                  <Text style={styles.detailValueRequest} numberOfLines={2}>
                    {item.lokasi_sesi}
                  </Text>
                </View>
                <View style={styles.detailItemRequest}>
                  <Text style={styles.detailLabelRequest}>Bayaran</Text>
                  <Text style={styles.detailValueRequest}>
                    {formatRupiah(item.harga_total)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtonRowRequest}>
                <TouchableOpacity
                  style={[styles.btnActionRequest, styles.btnDangerRequest]}
                  onPress={() => handleTolakSesi(item)}
                >
                  <Text style={styles.btnTextWhiteRequest}>Tolak</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnActionRequest, styles.btnPrimaryRequest]}
                  onPress={() => handleTerimaSesi(item)}
                >
                  <Text style={styles.btnTextWhiteRequest}>Terima</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNavbar
        currentScreen="Home"
        onNavigate={onNavigate}
        userRole="guru"
      />

      {/* Bottom Sheet Materi */}
      <Modal
        visible={isMateriVisible}
        animationType="fade"
        transparent
        onRequestClose={closeMateriSheet}
        statusBarTranslucent
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeMateriSheet}
          />
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
              <View style={styles.sheetHandle} />
            </View>
            {loadingMapel ? (
              <View style={[styles.centerContent, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#284B7A" />
                <Text style={styles.loadingText}>Memuat pelajaran...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetTitle}>Semua Pelajaran</Text>
                <View style={styles.subjectGrid}>
                  {allSubjects.length > 0 ? (
                    allSubjects.map(renderSubjectItem)
                  ) : (
                    <Text style={styles.emptyText}>
                      Tidak ada data mata pelajaran.
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flex: 1 },
  headerBackground: {
    backgroundColor: '#284B7A',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 70,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  welcomeText: { color: '#FFF', fontSize: 28, fontFamily: FONTS.regular },
  nameText: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },

  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    paddingLeft: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  sessionCardPlaceholder: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#A9A9A9',
    letterSpacing: 1.2,
  },
  badgeSegera: {
    backgroundColor: '#A2E9B4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeTextSegera: {
    fontFamily: FONTS.bold,
    color: '#FFF',
    fontSize: 11,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#000',
    marginBottom: 2,
  },
  subjectText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#777',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCol2: { width: '45%' },
  detailLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: '#ABABAB',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#1A1A2E',
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  btnAction: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#284B7A',
  },
  btnSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E0E5ED',
  },
  btnTextWhite: {
    color: '#FFF',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  btnTextBlue: {
    color: '#284B7A',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },

  menuGridContainer: { paddingHorizontal: 24, marginTop: 24 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between' },
  menuItemButton: { alignItems: 'center', width: '22%' },

  iconContainer: {
    width: 65,
    height: 65,
    backgroundColor: '#3A7D6B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIconImage: {
    width: 35,
    height: 35,
    tintColor: '#FFF',
  },
  menuButtonText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#333',
    textAlign: 'center',
  },
  divider: { height: 6, backgroundColor: '#F0F2F5', marginTop: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitleText: { fontSize: 14, fontFamily: FONTS.bold, color: '#888' },
  linkText: { fontSize: 14, fontFamily: FONTS.bold, color: '#3A7BD5' },

  requestCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  profileRowRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircleRequest: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextRequest: { color: '#FFF', fontFamily: FONTS.bold, fontSize: 16 },
  profileInfoRequest: { flex: 1, marginLeft: 12 },
  studentNameRequest: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#1A335E',
  },
  subjectTextRequest: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  badgeBaru: {
    backgroundColor: '#FFE6A3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextBaru: { color: '#D4A017', fontSize: 12, fontFamily: FONTS.bold },
  detailGridRequest: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItemRequest: { flex: 1, marginRight: 8 },
  detailLabelRequest: { fontSize: 12, color: '#999', fontFamily: FONTS.bold },
  detailValueRequest: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#333',
    marginTop: 4,
  },
  actionButtonRowRequest: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnActionRequest: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnPrimaryRequest: { backgroundColor: '#284B7A' },
  btnDangerRequest: { backgroundColor: '#DC3545' },
  btnTextWhiteRequest: { color: '#FFF', fontFamily: FONTS.bold, fontSize: 14 },

  loadingText: {
    fontFamily: FONTS.regular,
    marginTop: 10,
    color: '#999',
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '85%',
    paddingBottom: 100,
    marginBottom: -60,
  },
  sheetHandleArea: { width: '100%', alignItems: 'center', paddingVertical: 12 },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#DDE2EA',
    borderRadius: 2,
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#1A1A2E',
    marginBottom: 16,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  subjectItemContainer: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  subjectIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F0F3F8',
  },
  subjectIconImage: { width: 48, height: 48, borderRadius: 10 },
  subjectItemText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
  },
  emptyText: { fontFamily: FONTS.regular, color: '#999', marginLeft: 10 },
});

export default PageGuru;