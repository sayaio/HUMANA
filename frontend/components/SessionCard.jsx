import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { formatRupiah } from '../utils/formatters';
import CustomButton from './CustomButton';

const { width } = Dimensions.get('window');

const FONTS = {
    bold: 'SF-Pro-Display-Bold',
    regular: 'SF-Pro-Display-Regular',
};



const mapSesiKeJadwalAktifGuru = raw => {
    const status = (raw.status_pemesanan || 'dikonfirmasi').toLowerCase();
    const tipe = status === 'berlangsung' ? 'Berlangsung' : 'Aktif';
    const harga =
        raw.harga_total ||
        raw.tarif ||
        raw.bayaran ||
        ((raw.biaya_sesi || 0) + (raw.biaya_jarak || 0));
    return {
        item: {
            id: raw.id_pemesanan,
            id_pemesanan: raw.id_pemesanan,
            id_murid: raw.id_murid,
            nama_murid: raw.nama_murid,
            materi: raw.nama_materi || raw.materi?.nama_materi,
            nama_materi: raw.nama_materi || raw.materi?.nama_materi,
            nama_mapel: raw.nama_mapel || raw.mata_pelajaran?.nama_mapel,
            jenjang_pendidikan: raw.jenjang_pendidikan,
            waktu_mulai: raw.waktu_mulai,
            waktu_selesai: raw.waktu_selesai,
            waktu_string: raw.waktu_string,
            harga_total: harga,
            biaya_sesi: raw.biaya_sesi,
            biaya_jarak: raw.biaya_jarak,
            harga,
            lokasi_sesi: raw.lokasi_sesi || raw.lokasi || raw.alamat,
            status_pemesanan: status === 'berlangsung' ? 'berlangsung' : 'dikonfirmasi',
            tipe,
        },
        tipe,
    };
};

const SessionCard = ({ session, role, onDetailSesiAktif, onDetailPermintaan }) => {
    const s = session;
    const rawMulai = s.waktu_mulai || s.jam_mulai;
    const rawSelesai = s.waktu_selesai || s.jam_selesai;

    let waktu = '–';

    if (rawMulai && rawSelesai) {
        try {
            const formatTimeStr = (rawStr) => {
                if (typeof rawStr !== 'string') return '–';
                if (rawStr.includes('-') || rawStr.includes('T')) {
                    const dateObj = new Date(rawStr);
                    const formatZero = (num) => String(num).padStart(2, '0');
                    return `${formatZero(dateObj.getHours())}:${formatZero(dateObj.getMinutes())}`;
                } else {
                    return rawStr.substring(0, 5).replace('.', ':');
                }
            };
            waktu = `${formatTimeStr(rawMulai)} – ${formatTimeStr(rawSelesai)}`;
        } catch (error) {
            console.error("Gagal parsing waktu:", error);
            waktu = '–';
        }
    }

    const lokasi = s.lokasi || s.alamat || 'Alamat tidak tersedia';
    const bayaran = formatRupiah(s.tarif || s.bayaran || s.total_harga || 0);
    const gridStyle = role === 'guru' ? styles.gridCol3 : styles.gridCol2;
    const cardWidth = width - 40;

    const bukaDetailSesi = () => {
        if (role === 'murid') {
            if (onDetailSesiAktif) onDetailSesiAktif(s);
            return;
        }
        if (role === 'guru' && onDetailPermintaan) {
            const { item, tipe } = mapSesiKeJadwalAktifGuru(s);
            onDetailPermintaan(item, tipe);
        }
    };

    const cardDapatDiklik =
        (role === 'murid' && onDetailSesiAktif) ||
        (role === 'guru' && onDetailPermintaan);

    const cardInner = (
        <View style={[styles.sessionCard, { marginBottom: 0, marginRight: 0, width: '100%' }]}>
            <Text style={styles.cardLabel}>SESI HARI INI</Text>

            {role === 'guru' ? (
                <View style={styles.rowCenter}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(s.nama_murid || 'M').substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.sessionName} numberOfLines={1}>
                            {s.nama_murid || 'Nama Murid'}
                        </Text>
                        <Text style={styles.sessionSub} numberOfLines={1}>
                            {s.mata_pelajaran?.nama_mapel || s.nama_mapel || 'Mapel'} — {s.materi?.nama_materi || s.nama_materi || 'Materi'}
                        </Text>
                    </View>
                    <View style={styles.badgeGreen}>
                        <Text style={styles.badgeGreenText}>• Segera</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.rowCenter}>
                    {s.status_pembayaran === 'menunggu' && (
                        <View style={[styles.badgeYellow, { marginRight: 10 }]}>
                            <Text style={styles.badgeYellowText}>Bayar</Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sessionTitle} numberOfLines={2}>
                            <Text style={{ fontFamily: FONTS.bold }}>
                                {s.mata_pelajaran?.nama_mapel || s.nama_mapel || 'Mapel'}
                            </Text>
                            {' – '}{s.materi?.nama_materi || s.nama_materi || 'Materi'}
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.detailGrid}>
                <View style={gridStyle}>
                    <Text style={styles.detailLabel}>Waktu</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{waktu}</Text>
                </View>
                <View style={gridStyle}>
                    <Text style={styles.detailLabel}>{role === 'guru' ? 'Lokasi' : 'Guru'}</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                        {role === 'guru' ? lokasi : (s.nama_guru || '–')}
                    </Text>
                </View>
                {role === 'guru' && (
                    <View style={gridStyle}>
                        <Text style={styles.detailLabel}>Bayaran</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>{bayaran}</Text>
                    </View>
                )}
            </View>

                {role === 'guru' && (
                    <View style={styles.cardActions}>
                        <CustomButton variant="primary" title="Lihat Rute" style={{ flex: 1 }} />
                        <CustomButton variant="outline" title="Chat Murid" style={{ flex: 1 }} />
                    </View>
                )}
        </View>
    );

    return (
        <View style={{ width: cardWidth, marginRight: 16 }}>
            {cardDapatDiklik ? (
                <TouchableOpacity activeOpacity={1} onPress={bukaDetailSesi}>
                    {cardInner}
                </TouchableOpacity>
            ) : (
                cardInner
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sessionCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 14, paddingLeft: 20,
        elevation: 1, shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        marginBottom: 8,
    },
    cardLabel: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 10, color: '#A9A9A9', letterSpacing: 1.2, marginBottom: 8,
    },
    sessionTitle: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 17, color: '#1A1A2E', marginBottom: 8, lineHeight: 22,
    },
    sessionName: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 15, color: '#1A1A2E',
    },
    sessionSub: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 12, color: '#777', marginTop: 1,
    },
    rowCenter: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontFamily: 'SF-Pro-Display-Bold', color: '#FFF', fontSize: 13 },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#4CAF50' },
    badgeGreenText: { fontFamily: 'SF-Pro-Display-Bold', color: '#4CAF50', fontSize: 11 },
    badgeYellow: { backgroundColor: '#FFFDE7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
    badgeYellowText: { fontFamily: 'SF-Pro-Display-Bold', color: '#F9A825', fontSize: 11 },
    detailGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', marginTop: 16,
    },
    gridCol3: { width: '30%', minWidth: 76 },
    gridCol2: { width: '45%' },
    detailLabel: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 12, color: '#ABABAB', marginBottom: 4,
    },
    detailValue: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 15, color: '#1A1A2E', lineHeight: 19,
    },
    cardActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
});

export default SessionCard;
