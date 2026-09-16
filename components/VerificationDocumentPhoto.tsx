import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { fetchVerificationPhotoDataUrl } from '@/services/api';

interface Props {
  verificationId: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

export function VerificationDocumentPhoto({
  verificationId,
  style,
  imageStyle,
  onPress,
}: Props) {
  const { colors, t } = useSettings();
  const styles = makeStyles(colors);
  const [uri, setUri] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setUri(undefined);

    fetchVerificationPhotoDataUrl(verificationId)
      .then((dataUrl) => {
        if (active) {
          setUri(dataUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [verificationId]);

  const content = loading ? (
    <View style={[styles.placeholder, imageStyle]}>
      <ActivityIndicator color={colors.primaryLight} />
    </View>
  ) : failed || !uri ? (
    <View style={[styles.placeholder, imageStyle]}>
      <Text style={styles.errorText}>{t('adminVerifyPhotoUnavailable')}</Text>
    </View>
  ) : (
    <Image source={{ uri }} style={[styles.image, imageStyle]} resizeMode="contain" />
  );

  if (onPress) {
    return (
      <Pressable style={style} onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={style}>{content}</View>;
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    placeholder: {
      alignItems: 'center',
      backgroundColor: colors.background,
      justifyContent: 'center',
      minHeight: 180,
      width: '100%',
    },
    image: {
      backgroundColor: colors.background,
      minHeight: 180,
      width: '100%',
    },
    errorText: {
      color: colors.textMuted,
      fontSize: 13,
      paddingHorizontal: 16,
      textAlign: 'center',
    },
  });
}
