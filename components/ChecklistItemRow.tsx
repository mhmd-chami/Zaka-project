import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChecklistItem } from '@/types';
import { categoryLabels, colors } from '@/constants/theme';

interface Props {
  item: ChecklistItem;
  onToggle: () => void;
  onPhoto: (uri: string) => void;
}

export function ChecklistItemRow({ item, onToggle, onPhoto }: Props) {
  async function handleScan() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera needed', 'Allow camera access to scan packed items.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      onPhoto(result.assets[0].uri);
    }
  }

  return (
    <View style={[styles.row, item.packed && styles.rowPacked]}>
      <Pressable style={styles.checkArea} onPress={onToggle}>
        <View style={[styles.checkbox, item.packed && styles.checkboxChecked]}>
          {item.packed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, item.packed && styles.namePacked]}>
            {item.name}
          </Text>
          <Text style={styles.category}>{categoryLabels[item.category]}</Text>
        </View>
      </Pressable>

      <Pressable style={styles.scanBtn} onPress={handleScan}>
        <Text style={styles.scanText}>📷</Text>
      </Pressable>

      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={styles.thumb} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowPacked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  namePacked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  category: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scanBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scanText: {
    fontSize: 18,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginLeft: 8,
  },
});
