import { Href, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { getSession } from '@/services/authStorage';
import { getHomeRoute } from '@/utils/routes';

export default function IndexScreen() {
  const [ready, setReady] = useState(false);
  const [homeRoute, setHomeRoute] = useState<Href | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setHomeRoute(getHomeRoute(session.role));
      }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>💳</Text>
        <Text style={styles.title}>ZakaPay</Text>
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      </View>
    );
  }

  if (homeRoute) {
    return <Redirect href={homeRoute} />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  spinner: {
    marginTop: 24,
  },
});
