import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 32, lineHeight: 38 }}>
          Perfil
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 16, lineHeight: 24 }}>
          Esta área é estática no MVP. A leitura dos conteúdos não exige cadastro ou login.
        </Text>
      </View>

      <View
        style={{
          gap: 10,
          padding: 18,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 18,
          backgroundColor: AppColors.surface,
        }}>
        <Text selectable style={{ color: AppColors.text, fontSize: 17, fontWeight: '800' }}>
          Preferências
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 15, lineHeight: 22 }}>
          Conteúdos em português, tom informativo e navegação sem autenticação enquanto a API não expõe perfil real.
        </Text>
      </View>

      <Link href="/gerenciar-categorias" asChild>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => ({
            minHeight: 56,
            padding: 16,
            borderRadius: 16,
            backgroundColor: AppColors.primary,
            opacity: pressed ? 0.82 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          })}>
          <Text style={{ color: AppColors.primaryForeground, fontSize: 16, fontWeight: '800' }}>
            Gerenciar categorias
          </Text>
          <IconSymbol name="chevron.right" size={22} color={AppColors.primaryForeground} />
        </Pressable>
      </Link>
    </AppScreen>
  );
}
