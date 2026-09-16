import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WalletView } from '@/components/WalletView';
import { useSettings } from '@/contexts/SettingsContext';
import { getSession } from '@/services/authStorage';
import { AuthSession } from '@/types';
import { getHomeRoute } from '@/utils/routes';

export default function WalletScreen() {
  const router = useRouter();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [session, setSession] = useState<AuthSession | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSession().then((s) => {
        if (!s) {
          router.replace('/login');
          return;
        }
        if (s.role !== 'user') {
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
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <WalletView session={session} showAddMoney showLogout={false} />;
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    loading: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
