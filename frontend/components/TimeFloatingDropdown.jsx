import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

const TIME_ITEM_HEIGHT = 40;
const MAX_VISIBLE = 5;

const TimeFloatingDropdown = ({
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    zIndex = 10,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = options.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const listHeight = Math.min(
        filtered.length * TIME_ITEM_HEIGHT,
        MAX_VISIBLE * TIME_ITEM_HEIGHT,
    );

    const closeDropdown = () => {
        if (!isOpen) setSearchQuery('');
        onToggle(!isOpen);
    };

    return (
        <View style={[
            styles.timeDropdownWrap,
            { zIndex },
            isOpen && { paddingBottom: 240 }
        ]}>
            <TouchableOpacity
                style={[styles.timeBox, isOpen && styles.timeBoxOpen]}
                onPress={closeDropdown}
                activeOpacity={0.7}
            >
                <Text style={[styles.timeText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Text
                    style={isOpen ? styles.chevronUpSmall : styles.chevronDownSmall}
                >
                    ▼
                </Text>
            </TouchableOpacity>

            {isOpen && options.length > 0 && (
                <View style={styles.floatingListTime}>
                    <View style={styles.searchBarWrapSmall}>
                        <Search size={16} color="#999" style={{ marginRight: 6 }} />
                        <TextInput
                            style={styles.searchInputSmall}
                            placeholder="Cari waktu..."
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="numbers-and-punctuation"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.searchClear}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView
                        style={{ maxHeight: listHeight || TIME_ITEM_HEIGHT }}
                        nestedScrollEnabled={true}
                        bounces={false}
                        showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
                        keyboardShouldPersistTaps="handled"
                    >
                        {filtered.length === 0 ? (
                            <View style={styles.emptyResult}>
                                <Text style={styles.emptyResultText}>Tidak ditemukan</Text>
                            </View>
                        ) : (
                            filtered.map((item, index) => (
                                <TouchableOpacity
                                    key={`${item}-${index}`}
                                    style={[
                                        styles.floatingItem,
                                        { height: TIME_ITEM_HEIGHT },
                                        value === item && styles.floatingItemSelected,
                                        index === filtered.length - 1 && styles.floatingItemLast,
                                    ]}
                                    onPress={() => {
                                        onSelect(item);
                                        onToggle(false);
                                        setSearchQuery('');
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <Text
                                        style={[
                                            styles.floatingItemText,
                                            value === item && styles.floatingItemTextSelected,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    timeDropdownWrap: { flex: 1, position: 'relative' },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        gap: 4,
    },
    timeBoxOpen: {
        borderColor: '#284B7A',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    timeText: { fontSize: 12, color: '#2D9CDB', fontWeight: '600' },
    placeholderText: { color: '#AAAAAA' },
    chevronDownSmall: { fontSize: 8, color: '#999' },
    chevronUpSmall: {
        fontSize: 8,
        color: '#284B7A',
        transform: [{ rotate: '180deg' }],
    },
    floatingListTime: {
        position: 'absolute',
        top: 44,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#284B7A',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        elevation: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    searchBarWrapSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F9F9F9',
        height: 40,
    },
    searchInputSmall: {
        flex: 1,
        fontSize: 12,
        color: '#333',
        paddingVertical: 2,
        height: 32,
    },
    searchClear: {
        fontSize: 13,
        color: '#999',
        paddingHorizontal: 6,
        fontWeight: 'bold',
    },
    floatingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    floatingItemSelected: { backgroundColor: '#F0F7FF' },
    floatingItemLast: { borderBottomWidth: 0 },
    floatingItemText: { fontSize: 14, color: '#333' },
    floatingItemTextSelected: { color: '#284B7A', fontWeight: '700' },
    emptyResult: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    emptyResultText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
});

export default TimeFloatingDropdown;
