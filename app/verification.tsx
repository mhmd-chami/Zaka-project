import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  AppState,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { DocumentPhotoCapture } from '@/components/DocumentPhotoCapture';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  isVerificationAnswersComplete,
  VerificationAnswers,
  VerificationQuestionsForm,
} from '@/components/VerificationQuestionsForm';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getLocationById, zakaLocations } from '@/data/locations';
import { api, ApiError, readLocalPhotoBase64 } from '@/services/api';
import { getSession } from '@/services/authStorage';
import {
  clearDocumentPhoto,
  getDocumentPhoto,
  getDocumentPhotoBase64,
  notifyBranchVerificationAdmins,
  saveDocumentPhoto,
} from '@/services/verificationStorage';
import { IdentityDocumentType, IdentityVerification } from '@/types';

interface VerificationState {
  configured: boolean;
  environment: 'test' | 'live';
  verification: IdentityVerification | null;
}

type Step = 'intro' | 'branch' | 'document-type' | 'capture' | 'questions' | 'submitted';

const emptyAnswers = (): VerificationAnswers => ({
  fullName: '',
  documentNumber: '',
  dateOfBirth: '',
  nationality: '',
  expiryDate: '',
});

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, t } = useSettings();
  const [state, setState] = useState<VerificationState>();
  const [step, setStep] = useState<Step>('intro');
  const [consent, setConsent] = useState(false);
  const [branchId, setBranchId] = useState(zakaLocations[0]?.id ?? 'loc-1');
  const [documentType, setDocumentType] = useState<IdentityDocumentType>('lebanese_id');
  const [photoUri, setPhotoUri] = useState<string>();
  const [photoBase64, setPhotoBase64] = useState<string>();
  const [answers, setAnswers] = useState<VerificationAnswers>(emptyAnswers);
  const [cameraOpen, setCameraOpen] = useState(false);
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
        setState(next);
        setError('');
        const done = next.verification?.status === 'approved';
        const waiting =
          next.verification?.status === 'pending' &&
          next.verification?.providerStatus === 'review';
        if (done) setStep('submitted');
        else if (waiting) setStep('submitted');
        if (
          next.verification &&
          (['approved', 'rejected', 'expired'].includes(next.verification.status) ||
            next.verification.providerStatus === 'review')
        ) {
          setLaunchUrl('');
        }
      }
    } catch (err) {
      if (!focused.current) return;
      if (err instanceof ApiError && err.status === 401) router.replace('/login');
      else setError(err instanceof Error ? err.message : t('verifyStatusError'));
    } finally {
      refreshing.current = false;
    }
  }, [router, t]);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      void refresh();
      getSession().then(async (session) => {
        if (!session) return;
        const [savedUri, savedBase64] = await Promise.all([
          getDocumentPhoto(session.userId),
          getDocumentPhotoBase64(session.userId),
        ]);
        if (savedUri) setPhotoUri(savedUri);
        if (savedBase64) setPhotoBase64(savedBase64);
      });
      const timer = setInterval(() => {
        if (AppState.currentState === 'active') void refresh();
      }, 15000);
      const subscription = AppState.addEventListener('change', (status) => {
        if (status === 'active') void refresh();
      });
      return () => {
        focused.current = false;
        clearInterval(timer);
        subscription.remove();
      };
    }, [refresh])
  );

  async function submitDocumentFlow() {
    if (!photoUri || !isVerificationAnswersComplete(answers) || !branchId) return;
    setBusy(true);
    setError('');
    try {
      const session = await getSession();
      const branch = getLocationById(branchId);
      const documentPhotoBase64 = photoBase64 ?? (await readLocalPhotoBase64(photoUri));
      const result = await api<{ verification: IdentityVerification }>('/verification/document', {
        method: 'POST',
        body: {
          consent: true,
          documentType,
          documentCaptured: true,
          documentPhotoBase64,
          locationId: branchId,
          ...answers,
        },
      });
      setState((current) =>
        current ? { ...current, verification: result.verification } : current
      );
      if (session && branch) {
        await notifyBranchVerificationAdmins(
          branchId,
          branch.name,
          session.name,
          session.phone
        );
      }
      setStep('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verifySubmitError'));
    } finally {
      setBusy(false);
    }
  }

  async function startVeriff() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ verification: IdentityVerification; url?: string }>(
        '/verification/session',
        { method: 'POST', body: { consent } }
      );
      setState((current) =>
        current ? { ...current, verification: result.verification } : current
      );
      setLaunchUrl(result.url || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verifySubmitError'));
    } finally {
      setBusy(false);
    }
  }

  async function openVeriffCamera() {
    try {
      await Linking.openURL(launchUrl);
    } catch {
      setError(t('verifyLinkError'));
    }
  }

  async function handlePhotoCaptured(photo: { uri: string; base64: string }) {
    setPhotoUri(photo.uri);
    setPhotoBase64(photo.base64);
    const session = await getSession();
    if (session) await saveDocumentPhoto(session.userId, photo.uri, photo.base64);
    setStep('questions');
  }

  const verification = state?.verification;
  const approved =
    verification?.status === 'approved' && verification.environment === state?.environment;
  const waitingForBranch =
    verification?.status === 'pending' && verification?.providerStatus === 'review';
  const underReview = waitingForBranch && step !== 'submitted';
  const testMode = (verification?.environment || state?.environment) === 'test';
  const questionsReady = isVerificationAnswersComplete(answers);
  const verificationBranch = getLocationById(verification?.locationId ?? branchId);
  const branchLabel = (name?: string) => name ?? t('branch');

  const descriptions: Record<string, string> = {
    pending: t('verifyStatusPending'),
    approved: testMode ? t('verifyStatusApprovedTest') : t('verifyStatusApprovedLive'),
    rejected: t('verifyStatusRejected'),
    resubmission_requested: t('verifyStatusResubmit'),
    expired: t('verifyStatusExpired'),
  };

  function renderStepContent() {
    if (approved) {
      return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppIcon name="shield" size={32} color={colors.primaryLight} />
          <Text style={[styles.section, { color: colors.text, marginTop: 12 }]}>
            {testMode ? t('verifyCompleteTest') : t('verifyCompleteLive')}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {verification ? descriptions[verification.status] : t('verifyCompleteBody')}
          </Text>
        </View>
      );
    }

    if (step === 'submitted' || waitingForBranch) {
      return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppIcon name="store" size={32} color={colors.goldLight} />
          <Text style={[styles.section, { color: colors.text, marginTop: 12 }]}>
            {t('verifySubmittedTitle')}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('verifySubmittedBody').replace('{branch}', branchLabel(verificationBranch?.name))}
          </Text>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            {t('verifyBranchPending').replace('{branch}', branchLabel(verificationBranch?.name))}
          </Text>
        </View>
      );
    }

    if (underReview) {
      return (
        <Text style={[styles.body, { color: colors.textSecondary }]}>{t('verifyUnderReview')}</Text>
      );
    }

    switch (step) {
      case 'intro':
        return (
          <>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{t('verifyIntroBody')}</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.section, { color: colors.text }]}>{t('verifyStepsTitle')}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{t('verifyStepsList')}</Text>
              <Text style={[styles.note, { color: colors.textMuted }]}>{t('verifyPhotoPrivacy')}</Text>
            </View>
            <View style={styles.consent}>
              <Switch
                accessibilityLabel={t('verifyConsentLabel')}
                value={consent}
                onValueChange={setConsent}
              />
              <Text style={[styles.note, { flex: 1, color: colors.textSecondary }]}>
                {t('verifyConsentText')}
              </Text>
            </View>
            <PrimaryButton
              label={t('verifyStart')}
              onPress={() => setStep('branch')}
              disabled={!consent}
            />
          </>
        );

      case 'branch':
        return (
          <>
            <Text style={[styles.section, { color: colors.text }]}>{t('verifyChooseBranch')}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{t('verifyChooseBranchBody')}</Text>
            <View style={styles.choiceRow}>
              {zakaLocations.map((loc) => (
                <Pressable
                  key={loc.id}
                  style={[
                    styles.choice,
                    {
                      backgroundColor: colors.surfaceSoft,
                      borderColor: branchId === loc.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setBranchId(loc.id)}
                >
                  <AppIcon name="store" size={24} color={colors.primaryLight} />
                  <Text style={[styles.choiceTitle, { color: colors.text }]}>{loc.name}</Text>
                  <Text style={[styles.note, { color: colors.textSecondary }]}>{loc.address}</Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton label={t('verifyContinueDoc')} onPress={() => setStep('document-type')} />
          </>
        );

      case 'document-type':
        return (
          <>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{t('verifyChooseDoc')}</Text>
            <View style={styles.choiceRow}>
              <Pressable
                style={[
                  styles.choice,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: documentType === 'lebanese_id' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setDocumentType('lebanese_id')}
              >
                <AppIcon name="user" size={28} color={colors.primaryLight} />
                <Text style={[styles.choiceTitle, { color: colors.text }]}>{t('verifyLebaneseId')}</Text>
                <Text style={[styles.note, { color: colors.textSecondary }]}>{t('verifyLebaneseIdHint')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.choice,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: documentType === 'passport' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setDocumentType('passport')}
              >
                <AppIcon name="shield" size={28} color={colors.goldLight} />
                <Text style={[styles.choiceTitle, { color: colors.text }]}>{t('verifyPassport')}</Text>
                <Text style={[styles.note, { color: colors.textSecondary }]}>{t('verifyPassportHint')}</Text>
              </Pressable>
            </View>
            <PrimaryButton label={t('verifyContinueCapture')} onPress={() => setStep('capture')} />
          </>
        );

      case 'capture':
        return (
          <>
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              {documentType === 'passport' ? t('verifyCapturePassportBody') : t('verifyCaptureIdBody')}
            </Text>
            {photoUri ? (
              <View style={styles.previewCard}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                <Pressable onPress={() => setCameraOpen(true)}>
                  <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{t('verifyRetake')}</Text>
                </Pressable>
              </View>
            ) : null}
            <PrimaryButton
              label={photoUri ? t('verifyContinueQuestions') : t('verifyOpenCamera')}
              onPress={() => (photoUri ? setStep('questions') : setCameraOpen(true))}
            />
          </>
        );

      case 'questions':
        return (
          <>
            <VerificationQuestionsForm values={answers} onChange={(patch) => setAnswers((v) => ({ ...v, ...patch }))} />
            <PrimaryButton
              label={busy ? t('verifySubmitting') : t('verifySubmit')}
              onPress={submitDocumentFlow}
              disabled={!photoUri || !questionsReady || busy}
            />
            <Pressable onPress={() => setStep('capture')} style={styles.backLink}>
              <Text style={{ color: colors.textSecondary }}>{t('verifyBackToPhoto')}</Text>
            </Pressable>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomPadding(insets.bottom, 20) },
        ]}
      >
        <View style={styles.heading}>
          <AppIcon name="shield" size={36} color={colors.primaryLight} />
          <Text style={[styles.title, { color: colors.text }]}>{t('verifyTitle')}</Text>
        </View>

        {verification && step === 'intro' && !approved ? (
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {descriptions[verification.status]}
          </Text>
        ) : null}

        {testMode ? (
          <Text style={[styles.note, { color: colors.warning }]}>{t('verifyTestNote')}</Text>
        ) : null}

        {error ? (
          <Text accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
            {error}
          </Text>
        ) : null}

        {!state && !error ? (
          <Text style={{ color: colors.textSecondary }}>{t('verifyLoading')}</Text>
        ) : null}

        {renderStepContent()}

        {state?.configured && !approved && !underReview && step === 'intro' ? (
          <View style={[styles.card, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
            <Text style={[styles.section, { color: colors.text }]}>{t('verifyVeriffOptional')}</Text>
            <Text style={[styles.note, { color: colors.textSecondary }]}>{t('verifyVeriffOptionalBody')}</Text>
            {launchUrl ? (
              <PrimaryButton label={t('verifyVeriffCamera')} onPress={openVeriffCamera} disabled={!consent} />
            ) : (
              <PrimaryButton
                label={busy ? t('verifyVeriffStarting') : t('verifyVeriffStart')}
                onPress={startVeriff}
                disabled={!consent || busy}
              />
            )}
          </View>
        ) : null}

        <Pressable accessibilityRole="button" onPress={refresh} style={styles.refresh}>
          <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>{t('verifyRefresh')}</Text>
        </Pressable>

        {!approved && !waitingForBranch && step !== 'intro' && step !== 'submitted' ? (
          <Pressable
            onPress={async () => {
              if (step === 'questions') setStep('capture');
              else if (step === 'capture') setStep('document-type');
              else if (step === 'document-type') setStep('branch');
              else setStep('intro');
            }}
            style={styles.backLink}
          >
            <Text style={{ color: colors.textSecondary }}>{t('verifyBack')}</Text>
          </Pressable>
        ) : null}

        {approved ? (
          <Pressable
            onPress={async () => {
              const session = await getSession();
              if (session) await clearDocumentPhoto(session.userId);
              setPhotoUri(undefined);
              setAnswers(emptyAnswers());
              setStep('intro');
            }}
            style={styles.backLink}
          >
            <Text style={{ color: colors.textSecondary }}>{t('verifyStartOver')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <DocumentPhotoCapture
        visible={cameraOpen}
        documentType={documentType}
        onClose={() => setCameraOpen(false)}
        onCaptured={handlePhotoCaptured}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 18 },
  heading: { alignItems: 'center', gap: 12, marginTop: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 24 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18, gap: 14, alignItems: 'flex-start' },
  section: { fontSize: 17, fontWeight: '700' },
  note: { fontSize: 13, lineHeight: 20 },
  consent: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  choiceRow: { gap: 12 },
  choice: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },
  choiceTitle: { fontSize: 16, fontWeight: '800' },
  previewCard: { gap: 10 },
  previewImage: { borderRadius: 16, height: 200, width: '100%' },
  refresh: { alignItems: 'center', padding: 14 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
});
