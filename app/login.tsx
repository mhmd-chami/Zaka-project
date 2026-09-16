import { IconLabel } from '@/components/AppIcon';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
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
import { colors, contentBottomPadding, radius, shadows } from '@/constants/theme';
import { completeGoogleSignUp, findGoogleAccount, login } from '@/services/authStorage';
import { GoogleIdentity, startGoogleSignIn } from '@/services/googleAuth';
import { getHomeRoute } from '@/utils/routes';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleIdentity, setGoogleIdentity] = useState<GoogleIdentity | null>(null);
  const [googlePhone, setGooglePhone] = useState('');
  const [error, setError] = useState('');

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

  async function handleGoogleLogin(credential?: string) {
    setError('');
    setGoogleLoading(true);
    const result = await startGoogleSignIn(credential);
    if (!result.ok) {
      setGoogleLoading(false);
      if (!result.cancelled) setError(result.error || 'Google sign-in did not complete.');
      return;
    }

    const account = await findGoogleAccount(result.identity);
    setGoogleLoading(false);
    if (account.error) { setError(account.error); return; }
    if (account.session) {
      await openSession(account.session);
      return;
    }
    setGoogleIdentity({ ...result.identity, ...account.identity });
  }

  async function handleCompleteGoogleSignUp() {
    if (!googleIdentity) return;
    setGoogleLoading(true);
    const result = await completeGoogleSignUp(googleIdentity, googlePhone);
    setGoogleLoading(false);
    if (!result.ok) {
      setError(result.error || 'Could not create account.');
      Alert.alert('Could not create account', result.error);
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
            <ZakaLogo size="md" showTagline />
            {error ? <Text accessibilityLiveRegion="polite" style={{ color: colors.danger, marginVertical: 12, textAlign: 'center' }}>{error}</Text> : null}

            <Text style={styles.title}>
              {googleIdentity ? 'One last step' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {googleIdentity
                ? `Add the phone number for ${googleIdentity.email}`
                : 'Sign in to your wallet'}
            </Text>

            {googleIdentity ? (
              <View style={[styles.formCard, shadows.card]}>
                <View style={styles.googleAccount}>
                  <Text style={styles.googleAccountName}>{googleIdentity.name}</Text>
                  <Text style={styles.googleAccountEmail}>{googleIdentity.email}</Text>
                </View>
                <AuthInput
                  label="Phone number"
                  placeholder="+961 70 123 456"
                  value={googlePhone}
                  onChangeText={setGooglePhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <PrimaryButton
                  label="Create my wallet"
                  onPress={handleCompleteGoogleSignUp}
                  disabled={googleLoading}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setGoogleIdentity(null);
                    setGooglePhone('');
                  }}
                >
                  <Text style={styles.cancelGoogle}>Use another sign-in method</Text>
                </Pressable>
              </View>
            ) : (
              <>
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

                  <PrimaryButton
                    label="Sign in"
                    onPress={handleLogin}
                    disabled={loading || googleLoading}
                  />
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>
                <GoogleSignInButton onPress={handleGoogleLogin} loading={googleLoading} />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/signup" asChild>
                    <Pressable>
                      <Text style={styles.link}>Create account</Text>
                    </Pressable>
                  </Link>
                </View>

                {process.env.EXPO_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true' ? <View style={styles.demoBox}>
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
                </View> : null}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 22,
  },
  divider: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
  setupNote: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setupNoteText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  googleAccount: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleAccountName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  googleAccountEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  cancelGoogle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
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
