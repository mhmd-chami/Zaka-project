import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { getAllUsers, roleLabel } from '@/services/authStorage';
import { UserAccount } from '@/types';

export default function OwnerUsersScreen() {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [users, setUsers] = useState<UserAccount[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllUsers().then(setUsers);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            <Text
              style={[
                styles.role,
                item.role === 'owner' && styles.roleOwner,
                item.role === 'admin' && styles.roleAdmin,
              ]}
            >
              {roleLabel(item.role)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: 20, paddingBottom: 40 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    phone: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    role: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
    },
    roleOwner: { color: colors.accent },
    roleAdmin: { color: colors.warning },
  });
}
