import { AppIcon } from '@/components/AppIcon';
import { useRouter } from 'expo-router';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import {
  AgentContext,
  AgentMessage,
  askAgent,
  buildAgentContext,
  createMessage,
  getQuickPromptKeys,
  getWelcomeMessage,
} from '@/services/supportAgent';

export default function SupportAgentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, t } = useSettings();
  const [context, setContext] = useState<AgentContext | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList<AgentMessage>>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    buildAgentContext().then((ctx) => {
      if (!ctx) {
        router.replace('/login');
        return;
      }
      setContext(ctx);
      setMessages([getWelcomeMessage(ctx)]);
    });
  }, [router]);

  useEffect(() => {
    scrollToEnd();
  }, [messages, thinking, scrollToEnd]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !context || thinking) return;

    setInput('');
    setMessages((prev) => [...prev, createMessage('user', trimmed)]);
    setThinking(true);

    try {
      const answer = await askAgent(trimmed, context);
      setMessages((prev) => [...prev, answer]);
    } finally {
      setThinking(false);
    }
  }

  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!context) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <AppIcon name="bot" size={22} color={colors.primaryLight} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{t('agentName')}</Text>
          <Text style={styles.heroSub}>{t('agentOnline')}</Text>
        </View>
      </View>

      <MessageList
        ref={listRef}
        messages={messages}
        thinking={thinking}
        typingLabel={t('agentTyping')}
        t={t}
        colors={colors}
        styles={styles}
        bottomPadding={contentBottomPadding(insets.bottom, 12)}
        onAction={(route) => router.push(route as never)}
      />

      <ChatFooter
        input={input}
        onChangeInput={setInput}
        thinking={thinking}
        onSend={sendText}
        t={t}
        colors={colors}
        styles={styles}
        bottomPadding={contentBottomPadding(insets.bottom, 10)}
      />
    </KeyboardAvoidingView>
  );
}

type AgentStyles = ReturnType<typeof makeStyles>;
type ThemeColors = ReturnType<typeof useSettings>['colors'];

const MessageList = memo(
  forwardRef<FlatList<AgentMessage>, {
    messages: AgentMessage[];
    thinking: boolean;
    typingLabel: string;
    t: (key: string) => string;
    colors: ThemeColors;
    styles: AgentStyles;
    bottomPadding: number;
    onAction: (route: string) => void;
  }>(function MessageList(
    { messages, thinking, typingLabel, t, colors, styles, bottomPadding, onAction },
    ref
  ) {
  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={(item) => item.id}
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
      renderItem={({ item }) => (
        <View
          style={[
            styles.bubbleWrap,
            item.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAgent,
          ]}
        >
          {item.role === 'assistant' ? (
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>Z</Text>
            </View>
          ) : null}
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.agentBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' ? styles.userBubbleText : styles.agentBubbleText,
              ]}
            >
              {item.text}
            </Text>
            {item.actions?.map((action) => (
              <Pressable
                key={action.route + action.labelKey}
                style={styles.actionBtn}
                onPress={() => onAction(action.route)}
              >
                <Text style={styles.actionBtnText}>{t(action.labelKey)}</Text>
                <AppIcon name="chevron-right" size={14} color={colors.primaryLight} />
              </Pressable>
            ))}
          </View>
        </View>
      )}
      ListFooterComponent={
        thinking ? (
          <View style={[styles.bubbleWrap, styles.bubbleWrapAgent]}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>Z</Text>
            </View>
            <View style={[styles.bubble, styles.agentBubble, styles.typingBubble]}>
              <Text style={styles.typingText}>{typingLabel}</Text>
            </View>
          </View>
        ) : null
      }
    />
  );
  })
);

function ChatFooter({
  input,
  onChangeInput,
  thinking,
  onSend,
  t,
  colors,
  styles,
  bottomPadding,
}: {
  input: string;
  onChangeInput: (text: string) => void;
  thinking: boolean;
  onSend: (text: string) => void;
  t: (key: string) => string;
  colors: ThemeColors;
  styles: AgentStyles;
  bottomPadding: number;
}) {
  return (
    <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
      <View style={styles.chips}>
        {getQuickPromptKeys().map((key) => (
          <Pressable
            key={key}
            style={styles.chip}
            onPress={() => onSend(t(key))}
            disabled={thinking}
          >
            <Text style={styles.chipText}>{t(key)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={onChangeInput}
          placeholder={t('agentPlaceholder')}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primaryLight}
          cursorColor={colors.primaryLight}
          underlineColorAndroid="transparent"
          multiline
          maxLength={400}
          editable={!thinking}
          textAlignVertical="top"
          autoCorrect
          onSubmitEditing={() => onSend(input)}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendBtnDisabled]}
          onPress={() => onSend(input)}
          disabled={!input.trim() || thinking}
        >
          <AppIcon name="send" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    heroText: { flex: 1 },
    heroTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    heroSub: {
      color: colors.primaryLight,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    list: { flex: 1 },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      gap: 12,
    },
    bubbleWrap: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
    },
    bubbleWrapUser: {
      justifyContent: 'flex-end',
    },
    bubbleWrapAgent: {
      justifyContent: 'flex-start',
    },
    agentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryDark,
    },
    agentAvatarText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '800',
    },
    bubble: {
      maxWidth: '82%',
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    userBubble: {
      backgroundColor: colors.primaryDark,
      borderBottomRightRadius: 6,
    },
    agentBubble: {
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 6,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 22,
    },
    userBubbleText: {
      color: '#FFF',
    },
    agentBubbleText: {
      color: colors.text,
    },
    actionBtn: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: 'rgba(40,199,128,0.24)',
    },
    actionBtnText: {
      color: colors.primaryLight,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
    },
    typingBubble: {
      paddingVertical: 14,
    },
    typingText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontStyle: 'italic',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.backgroundAlt,
      paddingTop: 10,
      paddingHorizontal: 12,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 110,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingTop: 11,
      paddingBottom: 11,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryDark,
    },
    sendBtnDisabled: {
      opacity: 0.45,
    },
  });
}
