import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { iconPaths, type IconName } from '@/constants/icons';
import { useSettings } from '@/contexts/SettingsContext';

export type { IconName } from '@/constants/icons';

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function AppIcon({
  name,
  size = 24,
  color,
  strokeWidth = 1.8,
  style,
}: IconProps) {
  const { colors } = useSettings();
  const stroke = color ?? colors.primaryLight;
  return (
    <View
      style={[{ width: size, height: size, flexShrink: 0 }, style]}
      pointerEvents="none"
      accessible={false}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessible={false}
      >
        {iconPaths[name].map((d, index) => (
          <Path key={index} d={d} />
        ))}
      </Svg>
    </View>
  );
}

interface LabelProps {
  icon: IconName;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
  color?: ColorValue;
}

/** A native row keeps icons aligned with wrapping labels on Android and iOS. */
export function IconLabel({ icon, children, style, size, color }: LabelProps) {
  const { colors } = useSettings();
  const {
    color: textColor = colors.text,
    fontSize = 14,
    fontWeight,
    fontFamily,
    fontStyle,
    letterSpacing,
    lineHeight,
    textAlign,
    textTransform,
    cursor,
    ...layout
  } = StyleSheet.flatten(style) ?? {};

  return (
    <View style={[styles.labelRow, textAlign === 'center' && styles.centered, layout]}>
      <AppIcon
        name={icon}
        size={size ?? Math.max(fontSize + 2, 16)}
        color={color ?? textColor}
      />
      <Text
        style={{
          color: textColor,
          fontSize,
          fontWeight,
          fontFamily,
          fontStyle,
          letterSpacing,
          lineHeight,
          textAlign,
          textTransform,
          cursor,
          flexShrink: 1,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  centered: { justifyContent: 'center' },
});
