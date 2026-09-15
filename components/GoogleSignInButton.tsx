import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius } from '@/constants/theme';

function GoogleMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" accessibilityLabel="Google">
      <Path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <Path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.61A10 10 0 0 0 12 22Z" />
      <Path fill="#FBBC05" d="M6.39 13.88A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.88V7.51H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.49l3.34-2.61Z" />
      <Path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.51l3.34 2.61C7.18 7.75 9.39 5.99 12 5.99Z" />
    </Svg>
  );
}

export function GoogleSignInButton({
  onPress,
  loading = false,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !loading && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      <View style={styles.icon}>{loading ? <ActivityIndicator color="#4285F4" /> : <GoogleMark />}</View>
      <Text style={styles.label}>Continue with Google</Text>
      <View style={styles.spacer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    width: 28,
    alignItems: 'flex-start',
  },
  label: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '700',
  },
  spacer: {
    width: 28,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.7,
  },
});
