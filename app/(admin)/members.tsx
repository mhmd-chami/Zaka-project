import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { getAllUsers, roleLabel } from '@/services/authStorage';
import { UserAccount } from '@/types';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserAccount[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllUsers().then((all) =>
        setUsers(all.filter((u) => u.role === 'user'))
      );
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No users registered yet</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            <Text style={styles.role}>{roleLabel(item.role)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, paddingBottom: 40 },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
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
});
