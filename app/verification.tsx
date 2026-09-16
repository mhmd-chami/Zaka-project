import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { api, ApiError } from '@/services/api';
import { IdentityVerification } from '@/types';

interface VerificationState { configured: boolean; environment: 'test' | 'live'; verification: IdentityVerification | null }

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const [state, setState] = useState<VerificationState>();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [launchUrl, setLaunchUrl] = useState('');
  const refreshing = useRef(false);
  const focused = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const next = await api<VerificationState>('/verification');
      if (focused.current) {
        setState(next); setError('');
        if (next.verification && (['approved', 'rejected', 'expired'].includes(next.verification.status) || next.verification.providerStatus === 'review')) setLaunchUrl('');
      }
    } catch (error) {
      if (!focused.current) return;
      if (error instanceof ApiError && error.status === 401) router.replace('/login');
      else setError(error instanceof Error ? error.message : 'Could not check verification status.');
    } finally { refreshing.current = false; }
  }, [router]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void refresh();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 15000);
    const subscription = AppState.addEventListener('change', (status) => { if (status === 'active') void refresh(); });
    return () => { focused.current = false; clearInterval(timer); subscription.remove(); };
  }, [refresh]));

  async function start() {
    setBusy(true); setError('');
    try {
      const result = await api<{ verification: IdentityVerification; url?: string }>('/verification/session', { method: 'POST', body: { consent } });
      setState((current) => current ? { ...current, verification: result.verification } : current);
      setLaunchUrl(result.url || '');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not start verification.'); }
    finally { setBusy(false); }
  }

  async function openCamera() {
    try { await Linking.openURL(launchUrl); }
    catch { setError('Could not open the verification link. Please try again.'); }
  }

  const verification = state?.verification;
  const approved = verification?.status === 'approved' && verification.environment === state?.environment;
  const underReview = verification?.providerStatus === 'review';
  const testMode = (verification?.environment || state?.environment) === 'test';
  const descriptions: Record<string, string> = {
    pending: 'Continue the camera check below, then return here. The result will update automatically.',
    approved: testMode ? 'The test verification passed. This does not verify a real identity.' : 'Your identity has been verified by Veriff.',
    rejected: 'Veriff could not approve this verification. You can try again with a valid document.',
    resubmission_requested: 'Veriff needs another capture. Resume your session and follow the instructions.',
    expired: 'This session has ended. Start a new verification when you are ready.',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding(insets.bottom, 20) }]}>
      <View style={styles.heading}><AppIcon name="shield" size={36} color={colors.primaryLight} /><Text style={[styles.title, { color: colors.text }]}>Verify your identity</Text></View>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{underReview ? 'Your verification needs further review. We will update your status when a decision is available.' : verification ? descriptions[verification.status] : 'Use your camera to capture a government-issued ID and a selfie with Veriff.'}</Text>
      {testMode ? <Text style={[styles.note, { color: colors.warning }]}>Test environment — results do not grant an identity-verified badge.</Text> : null}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.text }]}>What you will need</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>1. Your original, valid ID card, passport or residence permit.{ '\n' }2. Good lighting and permission to use your camera.{ '\n' }3. A selfie, following the instructions on screen.</Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>Choose the issuing country and document in Veriff. Supported documents depend on the service plan. Lebanese Arabic-only ID support must be enabled by the operator.</Text>
        <Text style={[styles.note, { color: colors.textMuted }]}>Document images and your selfie are processed by Veriff. ZakaPay stores your verification status and session reference, not the captured images. A camera scan alone does not mark your account verified.</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://www.veriff.com/privacy-notice').catch(() => setError('Could not open the privacy notice.'))}><Text style={{ color: colors.primaryLight }}>Veriff privacy notice</Text></Pressable>
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={{ color: colors.danger }}>{error}</Text> : null}
      {!state && !error ? <Text style={{ color: colors.textSecondary }}>Checking verification service…</Text> : null}
      {state && !state.configured ? <Text style={[styles.note, { color: colors.warning }]}>Identity verification has not been enabled yet. Please return once the service is available.</Text> : null}
      {state?.configured && !approved && !underReview ? <>
        <View style={styles.consent}>
          <Switch accessibilityLabel="Consent to identity verification with Veriff" value={consent} onValueChange={setConsent} />
          <Text style={[styles.note, { flex: 1, color: colors.textSecondary }]}>I agree to send my document and selfie to Veriff for identity verification.</Text>
        </View>
        {launchUrl ? <PrimaryButton label="Scan ID with secure camera" onPress={openCamera} disabled={!consent} /> : <PrimaryButton label={busy ? 'Preparing verification…' : verification?.status === 'pending' || verification?.status === 'resubmission_requested' ? 'Resume verification' : 'Start verification'} onPress={start} disabled={!consent || busy} />}
        {launchUrl ? <Text style={[styles.note, { color: colors.textSecondary }]}>The secure camera flow supports the document types enabled for this account, including Lebanese IDs when enabled by Veriff. Return here after the ID and selfie checks to see your result.</Text> : null}
      </> : null}
      <Pressable accessibilityRole="button" onPress={refresh} style={styles.refresh}><Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Refresh status</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 18 },
  heading: { alignItems: 'center', gap: 12, marginTop: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 24 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18, gap: 14 },
  section: { fontSize: 17, fontWeight: '700' },
  note: { fontSize: 13, lineHeight: 20 },
  consent: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  refresh: { alignItems: 'center', padding: 14 },
});
