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
  Animated,
  Modal,
  Dimensions,
  PanResponder,
  RefreshControl,
} from 'react-native';
import {
  Calendar,
  BookOpen,
  Wallet,
  MousePointerClick,
  Bell,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Import services
import {
  fetchPermintaanBaru,
  fetchSesiDikonfirmasi,
} from '../services/matchingService';
import { fetchMapelByJenjang } from '../services/MateriService';
import { fetchNotifikasi, clearNotifikasi } from '../services/notifikasiService';
import BottomNavbar from '../components/BottomNavbar';
import CustomAlert from '../components/CustomAlert';
import { useAppAlert } from '../components/AppAlertProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const JENJANG_OPTIONS = ['SD', 'SMP', 'SMA'];

const SUBJECT_ICONS = {
  Matematika: require('../assets/matematika.png'),
  Informatika: require('../assets/informatika.png'),
  Biologi: require('../assets/biologi.png'),
  Kimia: require('../assets/kimia.png'),
  Fisika: require('../assets/fisika.png'), // ✅ FIXED: Sudah diperbaiki dari fiska.png menjadi fisika.png
  Sejarah: require('../assets/sejarah.png'),
  Sosiologi: require('../assets/sosiologi.png'),
  'Bahasa Inggris': require('../assets/inggris.png'),
  'Bahasa Indonesia': require('../assets/indonesia.png'),
  IPA: require('../assets/ipa.png'),
  IPS: require('../assets/ips.png'),
};

const FONTS = {
  bold: 'SF-Pro-Display-Bold',
  regular: 'SF-Pro-Display-Regular',
};

/** Card header = sesi dikonfirmasi (Jadwal Aktif), bukan permintaan baru. */
const mapSesiHeaderKeJadwalAktif = raw => {
  const status = (raw.status_pemesanan || 'dikonfirmasi').toLowerCase();
  const tipe = status === 'berlangsung' ? 'Berlangsung' : 'Aktif';
  const harga =
    raw.harga_total ||
    ((raw.biaya_sesi || 0) + (raw.biaya_jarak || 0));
  return {
    item: {
      id: raw.id_pemesanan,
      id_pemesanan: raw.id_pemesanan,
      id_murid: raw.id_murid,
      nama_murid: raw.nama_murid,
      materi: raw.nama_materi,
      nama_materi: raw.nama_materi,
      nama_mapel: raw.nama_mapel,
      jenjang_pendidikan: raw.jenjang_pendidikan,
      waktu_mulai: raw.waktu_mulai,
      waktu_selesai: raw.waktu_selesai,
      waktu_string: raw.waktu_string,
      harga_total: harga,
      biaya_sesi: raw.biaya_sesi,
      biaya_jarak: raw.biaya_jarak,
      harga,
      lokasi_sesi: raw.lokasi_sesi,
      status_pemesanan:
        status === 'berlangsung' ? 'berlangsung' : 'dikonfirmasi',
      tipe,
    },
    tipe,
  };
};

const PageGuru = ({ guruData, onNavigate, onSelectSubject, onDetailPermintaan }) => {
  const { showInfo } = useAppAlert();
  const { width: windowWidth } = useWindowDimensions();

  const [permintaan, setPermintaan] = useState([]);
  const [sesiDikonfirmasi, setSesiDikonfirmasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState(false);

  const LAT_GURU_MOCK = -6.9744;
  const LNG_GURU_MOCK = 107.6303;

  const loadPermintaan = async (isPullRefresh = false) => {
    if (!guruData || !guruData.id) {
      if (!isPullRefresh) setLoading(false);
      return;
    }

    if (!isPullRefresh) setLoading(true);
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

    const resNotif = await fetchNotifikasi('guru', guruData.id);
    if (resNotif && resNotif.success && Array.isArray(resNotif.data) && resNotif.data.length > 0) {
        const maxId = Math.max(...resNotif.data.map(n => n.id_notifikasi));
        const lastRead = await AsyncStorage.getItem(`last_read_notif_${guruData.id}`);
        if (!lastRead || maxId > parseInt(lastRead)) {
            setUnreadNotif(true);
        } else {
            setUnreadNotif(false);
        }
    } else {
        setUnreadNotif(false);
    }

    if (!isPullRefresh) setLoading(false);
  };

  useEffect(() => {
    loadPermintaan();
  }, [guruData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPermintaan(true);
    setRefreshing(false);
  };



  const formatRupiah = number => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatTanggalCard = raw => {
    if (!raw) return '';
    const tanggalObj = new Date(raw);
    if (isNaN(tanggalObj.getTime())) return '';
    return tanggalObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // States & Bottom sheet untuk fitur list mata pelajaran
  const [isMateriVisible, setIsMateriVisible] = useState(false);
  const [selectedJenjang, setSelectedJenjang] = useState(null);
  const [mapelCacheByJenjang, setMapelCacheByJenjang] = useState({});
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

  const resetMateriSheetState = () => {
    setSelectedJenjang(null);
    setMapelCacheByJenjang({});
    setAllSubjects([]);
    setLoadingMapel(false);
  };

  const openMateriSheet = () => {
    resetMateriSheetState();
    setIsMateriVisible(true);
  };

  const closeMateriSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsMateriVisible(false);
      resetMateriSheetState();
    });
  };

  const handleSelectJenjang = async jenjang => {
    setSelectedJenjang(jenjang);

    if (jenjang in mapelCacheByJenjang) {
      setAllSubjects(mapelCacheByJenjang[jenjang]);
      return;
    }

    setLoadingMapel(true);
    setAllSubjects([]);
    try {
      const data = await fetchMapelByJenjang(jenjang);
      setMapelCacheByJenjang(prev => ({ ...prev, [jenjang]: data }));
      setAllSubjects(data);
    } catch (err) {
      showInfo('Error', err.message);
      setSelectedJenjang(null);
      setAllSubjects([]);
    } finally {
      setLoadingMapel(false);
    }
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
    const bukaDetailSesi = () => {
      if (!onDetailPermintaan) return;
      const { item: mapped, tipe } = mapSesiHeaderKeJadwalAktif(item);
      onDetailPermintaan(mapped, tipe);
    };

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        activeOpacity={1}
        onPress={bukaDetailSesi}
        disabled={!onDetailPermintaan}
      >
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
              {formatRupiah(
                item.harga_total ||
                  (item.biaya_sesi || 0) + (item.biaya_jarak || 0),
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
        nestedScrollEnabled
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#284B7A']}
            tintColor="#284B7A"
          />
        }
      >
        <View style={styles.headerSection}>
          <View style={styles.headerBackground}>
            <Image
              source={LOGO_SOURCE}
              style={styles.headerWatermark}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.greetingContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View>
              <Text style={styles.greetingLabel}>Selamat Datang,</Text>
              <Text style={styles.greetingName}>{guruData?.name || 'Guru'}</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('Notifikasi')} style={{ position: 'relative', padding: 4, marginTop: 10 }}>
                <Bell size={24} color="#FFF" />
                {unreadNotif && <View style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', borderWidth: 1, borderColor: '#FFF' }} />}
            </TouchableOpacity>
          </View>

          <View>{renderSessionCard()}</View>

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
                onPress={openMateriSheet}
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
            </View>
          </View>

          <View style={styles.divider} />
        </View>

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
              <View style={styles.cardHeaderRequest}>
                <View style={styles.avatarCircleRequest}>
                  <Text style={styles.avatarTextRequest}>
                    {item.nama_murid
                      ? item.nama_murid.substring(0, 2).toUpperCase()
                      : 'SN'}
                  </Text>
                </View>
                <View style={styles.cardMainMetaRequest}>
                  <Text style={styles.studentNameRequest}>
                    {item.nama_murid}
                  </Text>
                  <Text style={styles.materiTextRequest} numberOfLines={1}>
                    {item.nama_materi}
                  </Text>
                </View>
              </View>

              <View style={styles.cardGridInfoRequest}>
                <View style={styles.gridInfoBoxRequest}>
                  <Text style={styles.infoLabelRequest}>Tanggal</Text>
                  <Text style={styles.infoValueRequest}>
                    {formatTanggalCard(item.waktu_mulai)}
                  </Text>
                </View>
                <View style={styles.gridInfoBoxRequest}>
                  <Text style={styles.infoLabelRequest}>Waktu</Text>
                  <Text style={styles.infoValueRequest}>
                    {item.waktu_string}
                  </Text>
                </View>
                <View style={styles.gridInfoBoxRequest}>
                  <Text style={styles.infoLabelRequest}>Bayaran</Text>
                  <Text style={styles.infoValueRequest}>
                    Rp {item.harga_total.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActionRowRequest}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={styles.btnLihatDetailRequest}
                  onPress={() =>
                    onDetailPermintaan && onDetailPermintaan(item, 'Permintaan')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnTextLihatDetailRequest}>
                    Lihat Detail
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.jenjangChipRow}>
                {JENJANG_OPTIONS.map(jenjang => (
                  <TouchableOpacity
                    key={jenjang}
                    style={[
                      styles.jenjangChip,
                      selectedJenjang === jenjang && styles.jenjangChipActive,
                    ]}
                    onPress={() => handleSelectJenjang(jenjang)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.jenjangChipText,
                        selectedJenjang === jenjang && styles.jenjangChipTextActive,
                      ]}
                    >
                      {jenjang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!selectedJenjang ? (
                <Text style={styles.emptyText}>
                  Pilih jenjang untuk melihat mata pelajaran.
                </Text>
              ) : loadingMapel ? (
                <View style={[styles.centerContent, { paddingVertical: 40 }]}>
                  <ActivityIndicator size="large" color="#284B7A" />
                  <Text style={styles.loadingText}>Memuat pelajaran...</Text>
                </View>
              ) : (
                <View style={styles.subjectGrid}>
                  {allSubjects.length > 0 ? (
                    allSubjects.map(renderSubjectItem)
                  ) : (
                    <Text style={styles.emptyText}>
                      {`Tidak ada mata pelajaran untuk jenjang ${selectedJenjang}.`}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  headerSection: { position: 'relative', zIndex: 1 },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 290,
    backgroundColor: '#284B7A',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerWatermark: {
    position: 'absolute',
    right: -20,
    top: -10,
    width: 240,
    height: 240,
    tintColor: '#FFF',
    opacity: 0.06,
  },
  greetingContainer: { marginTop: 100, paddingHorizontal: 35, marginBottom: 24 },
  greetingLabel: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 2,
  },
  greetingName: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#FFF',
    lineHeight: 38,
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
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#3A7D6B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeTextSegera: {
    fontFamily: FONTS.bold,
    color: '#3A7D6B',
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
    lineHeight: 18,
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
    marginTop: 16,
  },
  gridCol2: { width: '45%' },
  detailLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: '#ABABAB',
    marginBottom: 2,
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

  menuGridContainer: { paddingHorizontal: 24, marginTop: 28 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  menuItemButton: { alignItems: 'center', width: '28%' },

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
  divider: {
    height: 1,
    backgroundColor: '#EAEEF3',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
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
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeaderRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircleRequest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextRequest: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardMainMetaRequest: { flex: 1, marginLeft: 14 },
  studentNameRequest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  materiTextRequest: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  cardGridInfoRequest: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingLeft: 2,
  },
  gridInfoBoxRequest: { flex: 1, paddingRight: 8 },
  infoLabelRequest: { fontSize: 11, color: '#999', marginBottom: 4 },
  infoValueRequest: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  cardActionRowRequest: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  btnLihatDetailRequest: {
    backgroundColor: '#284B7A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnTextLihatDetailRequest: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

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
  jenjangChipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  jenjangChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F3F8',
  },
  jenjangChipActive: { backgroundColor: '#284B7A' },
  jenjangChipText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#666',
  },
  jenjangChipTextActive: { color: '#FFF' },
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