import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';
import { getAllUsers, roleLabel, setUserRole } from '@/services/authStorage';
import { UserAccount, UserRole } from '@/types';

export default function OwnerAdminsScreen() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  const load = useCallback(async () => {
    const all = await getAllUsers();
    setAccounts(all.filter((u) => u.role !== 'owner'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function changeRole(user: UserAccount, newRole: UserRole) {
    Alert.alert(
      'Change role',
      `Set ${user.name} as ${roleLabel(newRole)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const result = await setUserRole(user.id, newRole);
            if (!result.ok) {
              Alert.alert('Error', result.error);
              return;
            }
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            load();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Promote users to admin or demote admins back to user.
      </Text>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.roleBadge}>{roleLabel(item.role)}</Text>
            </View>
            <View style={styles.actions}>
              {item.role === 'user' ? (
                <Pressable
                  style={styles.promoteBtn}
                  onPress={() => changeRole(item, 'admin')}
                >
                  <Text style={styles.promoteText}>Make Admin</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.demoteBtn}
                  onPress={() => changeRole(item, 'user')}
                >
                  <Text style={styles.demoteText}>Make User</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    padding: 20,
    paddingBottom: 0,
  },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { marginBottom: 12 },
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
  roleBadge: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
  },
  promoteBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  promoteText: {
    color: '#06130D',
    fontWeight: '700',
    fontSize: 13,
  },
  demoteBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoteText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
});
