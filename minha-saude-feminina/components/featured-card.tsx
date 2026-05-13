import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';

export function FeaturedCard({
  title,
  summary,
  href,
}: {
  title: string;
  summary: string;
  href?: Href;
}) {
  const content = (
    <View
      style={{
        gap: 12,
        padding: 20,
        borderRadius: 22,
        backgroundColor: AppColors.primary,
      }}>
      <Text style={{ color: AppColors.primaryForeground, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
        Destaque
      </Text>
      <Text
        selectable
        style={{
          color: AppColors.primaryForeground,
          fontFamily: Fonts.serif,
          fontSize: 28,
          lineHeight: 34,
        }}>
        {title}
      </Text>
      <Text selectable style={{ color: AppColors.primaryForeground, fontSize: 15, lineHeight: 22, opacity: 0.9 }}>
        {summary}
      </Text>
      {href ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: AppColors.primaryForeground, fontSize: 15, fontWeight: '700' }}>
            Ler agora
          </Text>
          <IconSymbol name="chevron.right" size={18} color={AppColors.primaryForeground} />
        </View>
      ) : null}
    </View>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
        {content}
      </Pressable>
    </Link>
  );
}
