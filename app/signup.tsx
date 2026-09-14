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
import { AuthInput } from '@/components/AuthInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ZakaLogo } from '@/components/ZakaLogo';
import { colors, radius } from '@/constants/theme';
import { signUp } from '@/services/authStorage';
import { sendWelcomeNotification } from '@/services/notificationStorage';
import { getHomeRoute } from '@/utils/routes';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signUp(name, phone, password);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Sign up failed', result.error);
      return;
    }

    await sendWelcomeNotification(result.session!.userId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Account created! 🎉', 'Your wallet is ready with $150.', [
      {
        text: 'Continue',
        onPress: () =>
          router.replace(getHomeRoute(result.session!.role)),
      },
    ]);
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <ZakaLogo size="md" />

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join ZakaPay and start sending money</Text>

          <View style={styles.formCard}>
            <AuthInput
              label="Full name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="At least 4 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <AuthInput
              label="Confirm password"
              placeholder="Repeat password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <PrimaryButton
              label="Create account"
              onPress={handleSignUp}
              disabled={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.goldLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
