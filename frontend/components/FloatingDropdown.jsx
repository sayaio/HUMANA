import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

const ITEM_HEIGHT = 44;
const MAX_VISIBLE = 5;

const FloatingDropdown = ({
    label,
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
        filtered.length * ITEM_HEIGHT,
        MAX_VISIBLE * ITEM_HEIGHT,
    );
    const actualHeight = listHeight + 48; // List height + Search bar height

    const closeDropdown = () => {
        if (!isOpen) setSearchQuery('');
        onToggle(!isOpen);
    };

    return (
        <View style={[
            styles.fieldContainer,
            { zIndex, elevation: zIndex },
            isOpen && { paddingBottom: actualHeight, marginBottom: 14 - actualHeight }
        ]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TouchableOpacity
                style={[styles.dropdownBox, isOpen && styles.dropdownBoxOpen]}
                onPress={closeDropdown}
                activeOpacity={0.7}
            >
                <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Text style={isOpen ? styles.chevronUp : styles.chevronDown}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.floatingList}>
                    <View style={styles.searchBarWrap}>
                        <Search size={18} color="#999" style={{ marginRight: 6 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Cari ${label.toLowerCase()}...`}
                            placeholderTextColor="#AAAAAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCorrect={false}
                            autoCapitalize="none"
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
                        style={{ maxHeight: listHeight || ITEM_HEIGHT }}
                        nestedScrollEnabled={true}
                        bounces={false}
                        showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
                        keyboardShouldPersistTaps="handled"
                    >
                        {filtered.length === 0 ? (
                            <View style={styles.emptyResult}>
                                <Text style={styles.emptyResultText}>
                                    Tidak ada hasil untuk "{searchQuery}"
                                </Text>
                            </View>
                        ) : (
                            filtered.map((item, index) => (
                                <TouchableOpacity
                                    key={`${item}-${index}`}
                                    style={[
                                        styles.floatingItem,
                                        { height: ITEM_HEIGHT },
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
                                    {value === item && <Text style={styles.checkmark}>✓</Text>}
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
    fieldContainer: { marginBottom: 14 },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 8,
    },
    dropdownBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
    },
    dropdownBoxOpen: {
        borderColor: '#284B7A',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownText: { fontSize: 14, color: '#333', flex: 1 },
    placeholderText: { color: '#AAAAAA' },
    chevronDown: { fontSize: 11, color: '#999' },
    chevronUp: {
        fontSize: 11,
        color: '#284B7A',
        transform: [{ rotate: '180deg' }],
    },
    floatingList: {
        position: 'absolute',
        top: 82,
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
    searchBarWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F9F9F9',
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        paddingVertical: 4,
        height: 36,
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
    checkmark: { fontSize: 14, color: '#284B7A', fontWeight: 'bold' },
    emptyResult: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    emptyResultText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
});

export default FloatingDropdown;
