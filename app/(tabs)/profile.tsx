import { AppIcon, IconLabel, type IconName } from '@/components/AppIcon';
import { MoneyActionIcon } from '@/components/MoneyActionIcon';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getLocationById } from '@/data/locations';
import {
  changePassword,
  getSession,
  getUserAccount,
  logout,
  updateUserName,
} from '@/services/authStorage';
import { getProfile } from '@/services/walletStorage';
import { AuthSession, SendMode, UserAccount, WalletProfile } from '@/types';

const AVATARS = ['Z', 'A', 'S', 'M', 'T', 'F', 'P', 'W', 'D', 'L'];
const APP_VERSION = '1.0.0';

function roleLabel(role: AuthSession['role'], t: (k: string) => string): string {
  switch (role) {
    case 'owner':
      return t('ownerDash').replace(' dashboard', '');
    case 'admin':
      return t('adminDash').replace(' dashboard', '');
    default:
      return 'ZakaPay user';
  }
}

function roleIcon(role: AuthSession['role']): IconName {
  switch (role) {
    case 'owner':
      return 'crown';
    case 'admin':
      return 'store';
    default:
      return 'user';
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, settings, patchSettings, refreshSettings, t } = useSettings();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);

  const [nameModal, setNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [passModal, setPassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pinModal, setPinModal] = useState(false);
  const [pinDraft, setPinDraft] = useState('');
  const [avatarModal, setAvatarModal] = useState(false);
  const [limitsModal, setLimitsModal] = useState(false);
  const [sendLimitDraft, setSendLimitDraft] = useState('500');
  const [cashLimitDraft, setCashLimitDraft] = useState('300');

  const load = useCallback(async () => {
    const s = await getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSession(s);
    setAccount(await getUserAccount(s.userId));
    setProfile(await getProfile());
    await refreshSettings();
  }, [router, refreshSettings]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const branch = getLocationById(session?.locationId);
  const styles = makeStyles(colors);

  function handleLogout() {
    Alert.alert(t('signOutConfirm'), t('signOutMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  async function saveName() {
    if (!session) return;
    const result = await updateUserName(session.userId, nameDraft);
    if (!result.ok) {
      Alert.alert('Error', result.error);
      return;
    }
    setNameModal(false);
    Alert.alert('Success', t('nameUpdated'));
    load();
  }

  async function savePassword() {
    if (!session) return;
    if (newPass !== confirmPass) {
      Alert.alert('Error', t('passwordMismatch'));
      return;
    }
    const result = await changePassword(session.userId, currentPass, newPass);
    if (!result.ok) {
      Alert.alert('Error', result.error);
      return;
    }
    setPassModal(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    Alert.alert('Success', t('passwordChanged'));
  }

  async function savePin() {
    if (pinDraft.length !== 4) return;
    await patchSettings({ pinCode: pinDraft, requirePinForSend: true });
    setPinModal(false);
    setPinDraft('');
    Alert.alert('Success', t('pinSet'));
  }

  async function saveLimits() {
    const send = parseFloat(sendLimitDraft);
    const cash = parseFloat(cashLimitDraft);
    if (!send || !cash || send <= 0 || cash <= 0) return;
    await patchSettings({
      dailySendLimit: send,
      dailyCashOutLimit: cash,
    });
    setLimitsModal(false);
    Alert.alert('Success', t('limitsUpdated'));
  }

  if (!session || !profile || !settings) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: contentBottomPadding(insets.bottom, 20) },
        ]}
      >
        <Pressable style={styles.avatarRing} onPress={() => setAvatarModal(true)}>
          <Text style={styles.avatarEmoji}>{settings.avatarEmoji}</Text>
          <View style={styles.avatarEdit}>
            <AppIcon name="edit" size={12} color={colors.text} />
          </View>
        </Pressable>

        <Pressable onPress={() => { setNameDraft(profile.name); setNameModal(true); }}>
          <Text style={styles.name}>{profile.name}</Text>
        </Pressable>

        <View style={styles.badges}>
          <View style={styles.roleBadge}>
            <AppIcon name={roleIcon(session.role)} size={12} color={colors.primaryLight} />
            <Text style={styles.roleText}>{roleLabel(session.role, t)}</Text>
          </View>
          {settings.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>{t('verified')}</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>{t('walletBalance')}</Text>
          <Text style={styles.balance}>${profile.balance.toFixed(2)}</Text>
          <View style={styles.divider} />
          <InfoLine icon="smartphone" label={t('zakaNumber')} value={profile.phone} colors={colors} />
          {session.email && (
            <InfoLine icon="mail" label={t('email')} value={session.email} colors={colors} />
          )}
          {account && (
            <InfoLine
              icon="calendar"
              label={t('memberSince')}
              value={formatDate(account.createdAt)}
              colors={colors}
            />
          )}
          {branch && (
            <InfoLine icon="store" label={t('branch')} value={branch.name} colors={colors} />
          )}
          <InfoLine
            icon="link"
            label={t('linkedAccount')}
            value={
              session.authProvider === 'google'
                ? t('googleAccount')
                : t('phonePassword')
            }
            colors={colors}
          />
        </View>

        <SectionTitle title={t('account')} colors={colors} />
        <MenuItem
          colors={colors}
          icon={<MoneyActionIcon action="receive" size={46} />}
          title={t('receiveQr')}
          subtitle={t('receiveQrSub')}
          onPress={() => router.push('/receive')}
        />
        <MenuItem
          colors={colors}
          icon={
            <View style={styles.historyIcon}>
              <AppIcon name="history" size={23} color={colors.primaryLight} />
            </View>
          }
          title={t('history')}
          subtitle={t('historySub')}
          onPress={() => router.push('/(tabs)/history')}
        />
        {session.role === 'owner' && (
          <MenuItem
            colors={colors}
            icon={
              <View style={styles.historyIcon}>
                <AppIcon name="crown" size={23} color={colors.goldLight} />
              </View>
            }
            title={t('ownerDash')}
            subtitle={t('ownerDashSub')}
            onPress={() => router.replace('/(owner)')}
          />
        )}
        {session.role === 'admin' && (
          <MenuItem
            colors={colors}
            icon={
              <View style={styles.historyIcon}>
                <AppIcon name="store" size={23} color={colors.admin} />
              </View>
            }
            title={t('adminDash')}
            subtitle={t('adminDashSub')}
            onPress={() => router.replace('/(admin)')}
          />
        )}

        <SectionTitle title={t('preferences')} colors={colors} />
        <SettingRow
          colors={colors}
          label={t('language')}
          value={settings.language === 'ar' ? t('arabic') : t('english')}
          onPress={() =>
            patchSettings({ language: settings.language === 'en' ? 'ar' : 'en' })
          }
        />
        <SettingRow
          colors={colors}
          label={t('theme')}
          value={settings.theme === 'light' ? t('light') : t('dark')}
          onPress={() =>
            patchSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
        />
        <SettingRow
          colors={colors}
          label={t('defaultSend')}
          value={
            settings.defaultSendMode === 'p2p' ? t('sendP2p') : t('sendBranch')
          }
          onPress={() => {
            const next: SendMode =
              settings.defaultSendMode === 'p2p' ? 'location' : 'p2p';
            patchSettings({ defaultSendMode: next });
          }}
        />
        <ToggleRow
          colors={colors}
          label={t('notifSound')}
          value={settings.notificationSound}
          onValueChange={(v) => patchSettings({ notificationSound: v })}
        />
        <ToggleRow
          colors={colors}
          label={t('notifVibration')}
          value={settings.notificationVibration}
          onValueChange={(v) => patchSettings({ notificationVibration: v })}
        />

        <SectionTitle title={t('security')} colors={colors} />
        {session.authProvider !== 'google' && (
          <SettingRow
            colors={colors}
            label={t('changePassword')}
            onPress={() => setPassModal(true)}
          />
        )}
        <SettingRow colors={colors} label={t('setPin')} onPress={() => setPinModal(true)} />
        <ToggleRow
          colors={colors}
          label={t('requirePin')}
          value={settings.requirePinForSend}
          onValueChange={(v) => patchSettings({ requirePinForSend: v })}
        />

        <SectionTitle title={t('limits')} colors={colors} />
        <SettingRow
          colors={colors}
          label={t('dailySendLimit')}
          value={`$${settings.dailySendLimit}`}
          onPress={() => {
            setSendLimitDraft(String(settings.dailySendLimit));
            setCashLimitDraft(String(settings.dailyCashOutLimit));
            setLimitsModal(true);
          }}
        />
        <SettingRow
          colors={colors}
          label={t('dailyCashOutLimit')}
          value={`$${settings.dailyCashOutLimit}`}
          onPress={() => {
            setSendLimitDraft(String(settings.dailySendLimit));
            setCashLimitDraft(String(settings.dailyCashOutLimit));
            setLimitsModal(true);
          }}
        />

        <SectionTitle title={t('support')} colors={colors} />
        <MenuItem
          colors={colors}
          icon={
            <View style={styles.historyIcon}>
              <AppIcon name="bot" size={23} color={colors.primaryLight} />
            </View>
          }
          title={t('aiAssistant')}
          subtitle={t('aiAssistantSub')}
          onPress={() => router.push('/support-agent')}
        />
        <SettingRow
          colors={colors}
          label={t('faq')}
          onPress={() => Alert.alert(t('faq'), t('faqBody'))}
        />
        <SettingRow
          colors={colors}
          label={t('contact')}
          onPress={() => Alert.alert(t('contact'), t('contactBody'))}
        />
        <SettingRow
          colors={colors}
          label={t('report')}
          onPress={() => Alert.alert(t('report'), t('reportBody'))}
        />

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <IconLabel icon="logout" style={styles.logoutText}>
            {t('signOut')}
          </IconLabel>
        </Pressable>

        <Text style={styles.version}>
          ZakaPay {t('version')} {APP_VERSION}
        </Text>
      </ScrollView>

      <FormModal
        visible={nameModal}
        title={t('editName')}
        onClose={() => setNameModal(false)}
        onSave={saveName}
        saveLabel={t('save')}
        colors={colors}
      >
        <TextInput
          style={styles.modalInput}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder={t('enterName')}
          placeholderTextColor={colors.textMuted}
        />
      </FormModal>

      <FormModal
        visible={passModal}
        title={t('changePassword')}
        onClose={() => setPassModal(false)}
        onSave={savePassword}
        saveLabel={t('save')}
        colors={colors}
      >
        <TextInput
          style={styles.modalInput}
          value={currentPass}
          onChangeText={setCurrentPass}
          placeholder={t('currentPassword')}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />
        <TextInput
          style={styles.modalInput}
          value={newPass}
          onChangeText={setNewPass}
          placeholder={t('newPassword')}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />
        <TextInput
          style={styles.modalInput}
          value={confirmPass}
          onChangeText={setConfirmPass}
          placeholder={t('confirmPassword')}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />
      </FormModal>

      <FormModal
        visible={pinModal}
        title={t('setPinTitle')}
        onClose={() => setPinModal(false)}
        onSave={savePin}
        saveLabel={t('save')}
        colors={colors}
      >
        <TextInput
          style={[styles.modalInput, styles.pinInput]}
          value={pinDraft}
          onChangeText={setPinDraft}
          placeholder={t('enterPin')}
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
        />
      </FormModal>

      <FormModal
        visible={limitsModal}
        title={t('editLimits')}
        onClose={() => setLimitsModal(false)}
        onSave={saveLimits}
        saveLabel={t('save')}
        colors={colors}
      >
        <Text style={styles.modalHint}>{t('sendLimitHint')}</Text>
        <TextInput
          style={styles.modalInput}
          value={sendLimitDraft}
          onChangeText={setSendLimitDraft}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.modalHint}>{t('cashOutLimitHint')}</Text>
        <TextInput
          style={styles.modalInput}
          value={cashLimitDraft}
          onChangeText={setCashLimitDraft}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textMuted}
        />
      </FormModal>

      <Modal visible={avatarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('pickAvatar')}
            </Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    settings.avatarEmoji === emoji && styles.avatarSelected,
                  ]}
                  onPress={async () => {
                    await patchSettings({ avatarEmoji: emoji });
                    setAvatarModal(false);
                  }}
                >
                  <Text style={styles.avatarOptionText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setAvatarModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>
                {t('cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function SectionTitle({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useSettings>['colors'];
}) {
  return (
    <Text
      style={{
        alignSelf: 'flex-start',
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: 8,
        marginBottom: 10,
        width: '100%',
      }}
    >
      {title}
    </Text>
  );
}

function InfoLine({
  icon,
  label,
  value,
  colors,
}: {
  icon: IconName;
  label: string;
  value: string;
  colors: ReturnType<typeof useSettings>['colors'];
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={icon} size={18} color={colors.primaryLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
          {label}
        </Text>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({
  colors,
  icon,
  title,
  subtitle,
  onPress,
}: {
  colors: ReturnType<typeof useSettings>['colors'];
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceSoft,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={onPress}
    >
      <View style={{ marginRight: 13 }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      <AppIcon name="chevron-right" size={20} />
    </Pressable>
  );
}

function SettingRow({
  colors,
  label,
  value,
  onPress,
}: {
  colors: ReturnType<typeof useSettings>['colors'];
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceSoft,
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={onPress}
    >
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 14 }}>
          {value}
        </Text>
      ) : (
        <AppIcon name="chevron-right" size={18} />
      )}
    </Pressable>
  );
}

function ToggleRow({
  colors,
  label,
  value,
  onValueChange,
}: {
  colors: ReturnType<typeof useSettings>['colors'];
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceSoft,
        borderRadius: 14,
        padding: 14,
        paddingLeft: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );
}

function FormModal({
  visible,
  title,
  children,
  onClose,
  onSave,
  saveLabel,
  colors,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  saveLabel: string;
  colors: ReturnType<typeof useSettings>['colors'];
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: '800',
              marginBottom: 16,
            }}
          >
            {title}
          </Text>
          {children}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Pressable
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={onClose}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: colors.primaryDark,
              }}
              onPress={onSave}
            >
              <Text style={{ color: '#FFF', fontWeight: '800' }}>{saveLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 18, alignItems: 'center' },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: { color: colors.textSecondary },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: 'rgba(40,199,128,0.34)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    avatarEmoji: { fontSize: 40 },
    avatarEdit: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    name: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
      marginBottom: 10,
      letterSpacing: -0.6,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 22,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(42,140,137,0.28)',
    },
    roleText: {
      color: colors.primaryLight,
      fontSize: 12,
      fontWeight: '700',
    },
    verifiedBadge: {
      backgroundColor: colors.goldSoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderGold,
    },
    verifiedText: {
      color: colors.goldLight,
      fontSize: 12,
      fontWeight: '700',
    },
    summaryCard: {
      width: '100%',
      backgroundColor: colors.surfaceSoft,
      borderRadius: 20,
      padding: 18,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    balance: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginBottom: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    historyIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    logoutBtn: {
      width: '100%',
      marginTop: 20,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,99,118,0.45)',
      backgroundColor: 'rgba(255,99,118,0.07)',
    },
    logoutText: { color: colors.danger, fontSize: 16, fontWeight: '800' },
    version: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 16,
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    pinInput: {
      textAlign: 'center',
      letterSpacing: 8,
      fontSize: 22,
    },
    modalHint: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 16,
      textAlign: 'center',
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarOption: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    avatarOptionText: { fontSize: 26 },
    modalCancel: { textAlign: 'center', fontWeight: '700', padding: 8 },
  });
}
