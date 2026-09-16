import { IconLabel } from '@/components/AppIcon';
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/AuthInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ZakaLogo } from '@/components/ZakaLogo';
import { contentBottomPadding, shadows } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { login } from '@/services/authStorage';
import { getHomeRoute } from '@/utils/routes';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme, setTheme, t } = useSettings();
  const styles = makeStyles(colors);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showDemoAccounts = __DEV__ || process.env.EXPO_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true';

  async function openSession(session: NonNullable<Awaited<ReturnType<typeof login>>['session']>) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(getHomeRoute(session.role));
  }

  async function handleLogin() {
    setError('');
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || 'Could not sign in.');
      Alert.alert('Login failed', result.error);
      return;
    }

    await openSession(result.session!);
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { paddingBottom: contentBottomPadding(insets.bottom, 12) },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              onPress={() => void setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={styles.themeToggle}
            >
              <Text style={styles.themeToggleText}>{theme === 'light' ? 'Dark' : 'Light'}</Text>
            </Pressable>
            <ZakaLogo size="md" showTagline />
            {error ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: colors.danger, marginVertical: 12, textAlign: 'center' }}
              >
                {error}
              </Text>
            ) : null}

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your wallet</Text>

            <View style={[styles.formCard, shadows.card]}>
              <AuthInput
                label="Phone number"
                placeholder="+961 70 123 456"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <AuthInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <PrimaryButton label="Sign in" onPress={handleLogin} disabled={loading} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text style={styles.link}>Create account</Text>
                </Pressable>
              </Link>
            </View>

            {showDemoAccounts ? (
              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>Demo accounts</Text>
                <IconLabel icon="crown" style={styles.demoLine}>
                  Owner: +96170000001 / owner123
                </IconLabel>
                <IconLabel icon="shield" style={styles.demoLine}>
                  Hamra: +96170000002 / admin123
                </IconLabel>
                <IconLabel icon="shield" style={styles.demoLine}>
                  Verdun: +96170000003 / admin123
                </IconLabel>
                <IconLabel icon="shield" style={styles.demoLine}>
                  Tripoli: +96170000004 / admin123
                </IconLabel>
                <IconLabel icon="shield" style={styles.demoLine}>
                  Saida: +96170000005 / admin123
                </IconLabel>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    themeToggle: {
      alignSelf: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    themeToggleText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '800',
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 20,
      letterSpacing: -0.6,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      marginTop: 6,
      lineHeight: 20,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 12,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    link: {
      color: colors.primaryLight,
      fontSize: 14,
      fontWeight: '700',
    },
    demoBox: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    demoTitle: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 12,
      marginBottom: 8,
      letterSpacing: 0.1,
    },
    demoLine: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
  });
}
