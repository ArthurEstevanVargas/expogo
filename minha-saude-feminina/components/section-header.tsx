import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AppColors, Fonts } from '@/constants/theme';

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text
        selectable
        style={{
          flex: 1,
          color: AppColors.text,
          fontFamily: Fonts.serif,
          fontSize: 23,
          lineHeight: 29,
        }}>
        {title}
      </Text>
      {action}
    </View>
  );
}
