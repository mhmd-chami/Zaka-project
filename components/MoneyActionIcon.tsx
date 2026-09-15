import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/constants/theme';

export type MoneyAction = 'send' | 'receive' | 'add-money';

const palettes: Record<MoneyAction, { background: string; accent: string; soft: string }> = {
  send: {
    background: '#123B2B',
    accent: colors.primaryLight,
    soft: '#D9F5E7',
  },
  receive: {
    background: '#102F3B',
    accent: '#62D6EA',
    soft: '#D9F7FB',
  },
  'add-money': {
    background: '#3B3115',
    accent: colors.goldLight,
    soft: '#FFF4C7',
  },
};

export function MoneyActionIcon({ action, size = 58 }: { action: MoneyAction; size?: number }) {
  const palette = palettes[action];

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: palette.background,
          borderColor: `${palette.accent}55`,
        },
      ]}
    >
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 36 36" fill="none">
        {action === 'send' ? (
          <>
            <Rect x="3.5" y="11" width="23" height="19" rx="5" fill={palette.accent} opacity="0.14" />
            <Rect x="3.5" y="11" width="23" height="19" rx="5" stroke={palette.soft} strokeWidth="2.2" />
            <Path d="M4 17h22.5M9 24h5" stroke={palette.accent} strokeWidth="2.4" strokeLinecap="round" />
            <Circle cx="27.5" cy="8.5" r="7" fill={palette.accent} />
            <Path
              d="M24.5 11.5 30.5 5.5M26.5 5.5h4v4"
              stroke="#0B1914"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : action === 'receive' ? (
          <>
            <Path d="M4 12V6a2 2 0 0 1 2-2h6M24 4h6a2 2 0 0 1 2 2v6M32 24v6a2 2 0 0 1-2 2h-6M12 32H6a2 2 0 0 1-2-2v-6" stroke={palette.soft} strokeWidth="2.4" strokeLinecap="round" />
            <Rect x="8" y="8" width="7" height="7" rx="1.5" fill={palette.accent} />
            <Rect x="21" y="8" width="7" height="7" rx="1.5" fill={palette.accent} />
            <Rect x="8" y="21" width="7" height="7" rx="1.5" fill={palette.accent} />
            <Path d="M21 21h3v3h4v4h-7v-7ZM17.5 16v8M14.5 21l3 3 3-3" stroke={palette.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <Rect x="4" y="9" width="25" height="20" rx="4" fill={palette.accent} opacity="0.16" />
            <Rect x="4" y="9" width="25" height="20" rx="4" stroke={palette.soft} strokeWidth="2.2" />
            <Path d="M4 15h25M9 23h5" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="28" cy="8" r="6" fill={palette.accent} />
            <Path d="M28 5v6M25 8h6" stroke="#172015" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
});
