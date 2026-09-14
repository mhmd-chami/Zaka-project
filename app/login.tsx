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
import { colors } from '@/constants/theme';
import { login } from '@/services/authStorage';
import { getHomeRoute } from '@/utils/routes';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Login failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const session = result.session!;
    router.replace(getHomeRoute(session.role));
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>💳</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your ZakaPay wallet</Text>

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

        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryText}>Sign in</Text>
        </Pressable>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo accounts</Text>
          <Text style={styles.demoLine}>👑 Owner: +96170000001 / owner123</Text>
          <Text style={styles.demoLine}>🛡️ Hamra: +96170000002 / admin123</Text>
          <Text style={styles.demoLine}>🛡️ Verdun: +96170000003 / admin123</Text>
          <Text style={styles.demoLine}>🛡️ Tripoli: +96170000004 / admin123</Text>
          <Text style={styles.demoLine}>🛡️ Saida: +96170000005 / admin123</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <Pressable>
              <Text style={styles.link}>Create account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primaryDark,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.7 },
  primaryText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  demoBox: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
  },
  demoLine: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
