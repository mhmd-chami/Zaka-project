import { Href, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ZakaLogo } from '@/components/ZakaLogo';
import { useSettings } from '@/contexts/SettingsContext';
import { getSession } from '@/services/authStorage';
import { getHomeRoute } from '@/utils/routes';

export default function IndexScreen() {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
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
      <ScreenBackground>
        <View style={styles.loading}>
          <ZakaLogo size="lg" showTagline />
          <ActivityIndicator color={colors.gold} style={styles.spinner} size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (homeRoute) {
    return <Redirect href={homeRoute} />;
  }

  return <Redirect href="/login" />;
}

function makeStyles(_colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      marginTop: 32,
    },
  });
}
