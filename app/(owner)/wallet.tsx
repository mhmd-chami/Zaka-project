import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WalletView } from '@/components/WalletView';
import { colors } from '@/constants/theme';
import { getSession } from '@/services/authStorage';
import { AuthSession } from '@/types';
import { getHomeRoute } from '@/utils/routes';

export default function OwnerWalletScreen() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSession().then((s) => {
        if (!s) {
          router.replace('/login');
          return;
        }
        if (s.role !== 'owner') {
          router.replace(getHomeRoute(s.role));
          return;
        }
        setSession(s);
      });
    }, [router])
  );

  if (!session) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <WalletView session={session} showLogout={false} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
