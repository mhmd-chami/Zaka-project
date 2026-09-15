import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from '@/components/AppIcon';
import type { BrandName } from '@/constants/brands';

export type { BrandName } from '@/constants/brands';

const brandPaths: Partial<Record<BrandName, string>> = {
  spotify:
    'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  netflix:
    'm5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z',
  steam:
    'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.39 3.39 0 0 1 2.1-.584l2.861-4.142V8.91a4.524 4.524 0 1 1 4.419 4.528l-4.076 2.911v.159a3.392 3.392 0 0 1-6.717.669L.436 15.27A12.005 12.005 0 1 0 11.979 0zM7.54 18.21l-1.473-.61a2.55 2.55 0 1 0 3.274-3.457 2.5 2.5 0 0 0-1.878-.03l1.523.63a1.88 1.88 0 1 1-1.445 3.467zm8.4-6.288a3.015 3.015 0 1 1 0-6.03 3.015 3.015 0 0 1 0 6.03zm.007-5.286a2.266 2.266 0 1 0 0 4.531 2.266 2.266 0 0 0 0-4.531z',
  amazon:
    'M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595.46-.2.76-.24.95-.01.12.174.09.336-.12.48-1.52 1.12-3.22 1.87-5.11 2.25a17.62 17.62 0 0 1-10.95-.577 17.88 17.88 0 0 1-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-2.01.99-3.41 2.78-4.19 1.13-.47 2.73-.77 4.84-.9v-.37c0-1.68-.58-2.52-1.74-2.52-1.11 0-1.81.52-2.1 1.56-.06.3-.21.47-.44.51l-2.52-.32c-.25-.06-.37-.18-.37-.39.25-1.29.85-2.25 1.82-2.88 1.11-.7 2.41-1.06 3.9-1.06 1.65 0 2.96.43 3.89 1.29.72.8 1.08 1.81 1.08 3.04v5.28c0 .75.27 1.44.81 2.07.24.3.23.52-.04.72l-1.96 1.71c-.17.14-.38.15-.63.05-.64-.54-1.15-1.1-1.52-1.68-.81.89-1.61 1.44-2.4 1.67-.5.15-1.1.23-1.83.23-2.4 0-3.6-1.28-3.6-3.84zm3.75-.44c0 1.25.53 1.88 1.58 1.88.75-.1 1.34-.51 1.78-1.22.35-.64.52-1.54.52-2.71v-.54c-2.58 0-3.88.86-3.88 2.59zm9.16 7.03c.35-.5 1.28-.81 2.79-.91.71 0 1.23.12 1.58.36.07.09.1.23.1.39 0 1.27-.53 2.48-1.58 3.63-.2.17-.32.18-.36.04.54-1.26.81-2.14.81-2.64 0-.15-.03-.27-.09-.34-.25-.29-1-.34-2.25-.16-.59.09-.92.1-1 .04-.03-.03-.04-.08 0-.12z',
  uber:
    'M0 7.97v4.96c0 1.87 1.3 3.1 3 3.1.83 0 1.56-.32 2.09-.87v.74H6.27V7.97H5.08v4.89c0 1.26-.85 2.11-1.95 2.11-1.11 0-1.94-.83-1.94-2.11V7.97H0zm7.44 0v7.93h1.13v-.73c.52.53 1.26.86 2.06.86a3.01 3.01 0 1 0 0-6.03c-.8 0-1.53.33-2.05.86V7.97H7.44zm9.87 2.04a3 3 0 0 0 .1 6.01c1.05 0 1.91-.46 2.49-1.23l-.83-.62c-.43.58-1 .85-1.66.85-.97 0-1.75-.7-1.91-1.64h4.7v-.37c0-1.72-1.22-3-2.89-3zm6.29.07c-.63 0-1.1.29-1.38.76v-.72h-1.13v5.78h1.14v-3.29c0-.89.55-1.47 1.3-1.47H24v-1.06h-.4zm-6.32.93c.85 0 1.56.59 1.76 1.47h-3.52c.2-.88.91-1.47 1.76-1.47zm-6.73.01a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
};

const colors: Record<BrandName, { background: string; foreground: string }> = {
  spotify: { background: '#12351F', foreground: '#1ED760' },
  netflix: { background: '#2C1115', foreground: '#E50914' },
  steam: { background: '#132B3E', foreground: '#66C0F4' },
  amazon: { background: '#2D2414', foreground: '#FF9900' },
  uber: { background: '#20242B', foreground: '#FFFFFF' },
  coffee: { background: '#302319', foreground: '#E1B382' },
  alfa: { background: '#D71920', foreground: '#FFFFFF' },
  touch: { background: '#06A7BB', foreground: '#FFFFFF' },
  mtn: { background: '#FFCC00', foreground: '#171717' },
};

export function BrandMark({ brand, size = 52 }: { brand: BrandName; size?: number }) {
  const palette = colors[brand];
  const path = brandPaths[brand];

  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size * 0.26,
          backgroundColor: palette.background,
        },
      ]}
    >
      {path ? (
        <Svg width={size * 0.57} height={size * 0.57} viewBox="0 0 24 24">
          <Path d={path} fill={palette.foreground} />
        </Svg>
      ) : brand === 'coffee' ? (
        <AppIcon name="coffee" size={size * 0.55} color={palette.foreground} strokeWidth={2.1} />
      ) : brand === 'mtn' ? (
        <View style={styles.mtnOval}>
          <Text style={styles.mtnText}>MTN</Text>
        </View>
      ) : (
        <Text style={[styles.wordmark, brand === 'touch' && styles.touch]}>{brand}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wordmark: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.6,
    textTransform: 'lowercase',
  },
  touch: {
    fontSize: 12,
    fontStyle: 'italic',
    letterSpacing: -0.9,
  },
  mtnOval: {
    width: '78%',
    height: '52%',
    borderWidth: 1.5,
    borderColor: '#171717',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mtnText: {
    color: '#171717',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
