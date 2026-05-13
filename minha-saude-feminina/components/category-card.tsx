import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import type { Category } from '@/types/category';

const accentColors = [AppColors.coral, AppColors.peach, AppColors.lavender, AppColors.sage, AppColors.accent];
const accentBackgrounds = [
  AppColors.softCoral,
  AppColors.softPeach,
  AppColors.softLavender,
  AppColors.softSage,
  AppColors.softAccent,
];

export function getCategoryAccent(category: Category) {
  const index = Math.max(0, (category.displayOrder || 1) - 1) % accentColors.length;

  return {
    color: accentColors[index],
    backgroundColor: accentBackgrounds[index],
  };
}

export function CategoryCard({ category, href }: { category: Category; href: Href }) {
  const accent = getCategoryAccent(category);

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 118,
          gap: 12,
          padding: 16,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: AppColors.border,
          backgroundColor: AppColors.surface,
          opacity: pressed ? 0.78 : 1,
        })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View
            style={{
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              backgroundColor: accent.backgroundColor,
            }}>
            <IconSymbol name="heart.text.square.fill" size={22} color={accent.color} />
          </View>
          <IconSymbol name="chevron.right" size={22} color={AppColors.mutedText} />
        </View>
        <Text
          selectable
          style={{
            color: AppColors.text,
            fontFamily: Fonts.serif,
            fontSize: 21,
            lineHeight: 26,
          }}>
          {category.name}
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
          {category.description}
        </Text>
      </Pressable>
    </Link>
  );
}
