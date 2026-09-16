import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';

export interface VerificationAnswers {
  fullName: string;
  documentNumber: string;
  dateOfBirth: string;
  nationality: string;
  expiryDate: string;
}

interface Props {
  values: VerificationAnswers;
  onChange: (patch: Partial<VerificationAnswers>) => void;
}

export function VerificationQuestionsForm({ values, onChange }: Props) {
  const { colors, t } = useSettings();
  const fields: { key: keyof VerificationAnswers; label: string; placeholder: string; keyboard?: 'default' | 'numeric' }[] = [
    { key: 'fullName', label: t('verifyQFullName'), placeholder: t('verifyQFullNameHint') },
    { key: 'documentNumber', label: t('verifyQDocNumber'), placeholder: t('verifyQDocNumberHint') },
    { key: 'dateOfBirth', label: t('verifyQDob'), placeholder: 'DD/MM/YYYY' },
    { key: 'nationality', label: t('verifyQNationality'), placeholder: t('verifyQNationalityHint') },
    { key: 'expiryDate', label: t('verifyQExpiry'), placeholder: 'DD/MM/YYYY' },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.intro, { color: colors.textSecondary }]}>{t('verifyQuestionsIntro')}</Text>
      {fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSoft,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={values[field.key]}
            onChangeText={(text) => onChange({ [field.key]: text })}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textMuted}
            autoCapitalize={field.key === 'fullName' || field.key === 'nationality' ? 'words' : 'none'}
          />
        </View>
      ))}
    </View>
  );
}

export function isVerificationAnswersComplete(values: VerificationAnswers): boolean {
  return Object.values(values).every((value) => value.trim().length >= 2);
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 4 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700' },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
