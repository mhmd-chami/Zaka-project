import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { IdentityDocumentScanner } from '@/components/IdentityDocumentScanner';
import { PrimaryButton } from '@/components/PrimaryButton';
import { contentBottomPadding, radius } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getSession, getUserAccount, submitIdentityVerification } from '@/services/authStorage';
import { IdentityDocumentType, IdentityVerification } from '@/types';

const DOCUMENTS: { type: IdentityDocumentType; label: string; description: string }[] = [
  { type: 'lebanese_id', label: 'Lebanese ID', description: 'Your Lebanese national identity card' },
  { type: 'passport', label: 'Passport', description: 'A valid passport issued by any country' },
  { type: 'residence_permit', label: 'Residence permit', description: 'A valid residence permit' },
];

function documentLabel(type: IdentityDocumentType): string {
  return DOCUMENTS.find((document) => document.type === type)?.label ?? 'Identity document';
}

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [userId, setUserId] = useState<string | null>(null);
  const [verification, setVerification] = useState<IdentityVerification>();
  const [documentType, setDocumentType] = useState<IdentityDocumentType>('lebanese_id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string>();
  const [extractedDetails, setExtractedDetails] = useState<{
    fullName?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    nationality?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    async function load() {
      const session = await getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const account = await getUserAccount(session.userId);
      if (active) {
        setUserId(session.userId);
        setVerification(account?.identityVerification);
        if (account?.identityVerification) {
          setDocumentType(account.identityVerification.documentType);
          setDocumentNumber(account.identityVerification.documentNumber);
        }
      }
    }
    load();
    return () => { active = false; };
  }, [router]));

  async function handleSubmit() {
    if (!userId) return;
    setLoading(true);
    const result = await submitIdentityVerification(userId, documentType, documentNumber, {
      documentPhotoUri: capturedPhotoUri,
      ...extractedDetails,
    });
    setLoading(false);
    if (!result.ok) {
      Alert.alert('Unable to submit', result.error);
      return;
    }
    setVerification(result.verification);
    Alert.alert('Submitted for review', 'We will review your identity document before approving your account.');
  }

  const locked = verification?.status === 'pending' || verification?.status === 'approved';
  const statusText = verification?.status === 'approved'
    ? 'Your identity has been approved.'
    : verification?.status === 'pending'
      ? 'Your document is waiting for review.'
      : 'Submit one government-issued document to verify your account.';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding(insets.bottom, 20) }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerIcon}>
        <AppIcon name="shield" size={30} color={colors.primaryLight} />
      </View>
      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>{statusText}</Text>

      <View style={styles.card}>
        <Pressable style={styles.scanButton} onPress={() => setScannerVisible(true)} disabled={locked}>
          <AppIcon name="scan" size={20} color={colors.primaryLight} />
          <View style={styles.scanText}>
            <Text style={styles.scanTitle}>Scan with camera</Text>
            <Text style={styles.scanSubtitle}>Read a barcode or capture your document</Text>
          </View>
        </Pressable>
        <Text style={styles.label}>Document type</Text>
        {DOCUMENTS.map((document) => (
          <Pressable
            key={document.type}
            style={[styles.option, documentType === document.type && styles.optionSelected]}
            onPress={() => setDocumentType(document.type)}
            disabled={locked}
          >
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{document.label}</Text>
              <Text style={styles.optionDescription}>{document.description}</Text>
            </View>
            <View style={[styles.radio, documentType === document.type && styles.radioSelected]} />
          </Pressable>
        ))}

        <Text style={[styles.label, styles.numberLabel]}>Document number</Text>
        <TextInput
          style={styles.input}
          value={documentNumber}
          onChangeText={setDocumentNumber}
          placeholder={`Enter your ${documentLabel(documentType).toLowerCase()} number`}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          editable={!locked}
        />
        {capturedPhotoUri && <Text style={styles.captured}>Document photo captured and attached for review.</Text>}
        <Text style={styles.privacy}>Your document number is stored securely on this device for this demo.</Text>

        {!locked && <PrimaryButton label="Submit for review" onPress={handleSubmit} disabled={loading} />}
        {locked && <Text style={styles.pending}>Status: {verification?.status === 'approved' ? 'Approved' : 'Pending review'}</Text>}
      </View>
      <IdentityDocumentScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={(result) => {
          if (result.documentNumber) setDocumentNumber(result.documentNumber);
          if (result.photoUri) setCapturedPhotoUri(result.photoUri);
          setExtractedDetails({
            fullName: result.fullName,
            dateOfBirth: result.dateOfBirth,
            expiryDate: result.expiryDate,
            nationality: result.nationality,
          });
          setScannerVisible(false);
        }}
      />
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { padding: 24 },
    headerIcon: { alignSelf: 'center', marginTop: 12, marginBottom: 12 },
    title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 24 },
    card: { backgroundColor: colors.surfaceSoft, borderColor: colors.borderStrong, borderRadius: radius.xl, borderWidth: 1, padding: 18 },
    scanButton: { alignItems: 'center', borderColor: colors.primaryLight, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', marginBottom: 20, padding: 14 },
    scanText: { marginLeft: 12 },
    scanTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    scanSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
    label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
    option: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', marginBottom: 10, padding: 13 },
    optionSelected: { borderColor: colors.primaryLight, backgroundColor: colors.surface },
    optionText: { flex: 1 },
    optionLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
    optionDescription: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
    radio: { borderColor: colors.textMuted, borderRadius: 10, borderWidth: 2, height: 20, marginLeft: 10, width: 20 },
    radioSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
    numberLabel: { marginTop: 12 },
    input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: 15, padding: 14 },
    privacy: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 18, marginTop: 10 },
    captured: { color: colors.primaryLight, fontSize: 12, marginTop: 10 },
    pending: { color: colors.primaryLight, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  });
}