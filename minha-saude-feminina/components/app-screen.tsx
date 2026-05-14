import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

import { AppColors } from '@/constants/theme';

export type AppScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}; 
// Tela Principal
export function AppScreen({ children, contentContainerStyle }: AppScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: AppColors.background }}
      contentContainerStyle={[
        {
          gap: 20,
          padding: 20,
          paddingBottom: 40,
          width: '100%',
          maxWidth: 520,
          alignSelf: 'center',
        },
        contentContainerStyle,
      ]}>
      {children}
    </ScrollView>
  );
}
