import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AppColors, Fonts } from '@/constants/theme';

export type StateViewProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
};

export function StateView({ title, message, actionLabel, onAction, loading = false }: StateViewProps) {
  return (
    <View
      style={{
        gap: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: AppColors.border,
        borderRadius: 18,
        backgroundColor: AppColors.surface,
      }}>
      {loading ? <ActivityIndicator color={AppColors.primary} /> : null}
      <Text
        selectable
        style={{
          color: AppColors.text,
          fontFamily: Fonts.serif,
          fontSize: 20,
          lineHeight: 26,
          textAlign: loading ? 'center' : 'left',
        }}>
        {title}
      </Text>
      {message ? (
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 15, lineHeight: 22 }}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => ({
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: AppColors.primary,
            opacity: pressed ? 0.82 : 1,
          })}>
          <Text style={{ color: AppColors.primaryForeground, fontSize: 15, fontWeight: '700' }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
