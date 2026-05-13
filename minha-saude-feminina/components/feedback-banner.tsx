import { Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export function FeedbackBanner({ type, message }: { type: 'success' | 'error'; message: string | null }) {
  if (!message) {
    return null;
  }

  const color = type === 'success' ? AppColors.success : AppColors.danger;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color,
        borderRadius: 14,
        padding: 12,
        backgroundColor: AppColors.surface,
      }}>
      <Text selectable style={{ color, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
        {message}
      </Text>
    </View>
  );
}
