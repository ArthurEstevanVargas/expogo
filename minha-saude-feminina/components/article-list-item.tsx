import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import type { Article } from '@/types/article';
import type { Category } from '@/types/category';

export function ArticleListItem({
  article,
  category,
  href,
}: {
  article: Article;
  category?: Category;
  href: Href;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 96,
          padding: 16,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 16,
          backgroundColor: AppColors.surface,
          opacity: pressed ? 0.78 : 1,
        })}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 6 }}>
            {category ? (
              <Text style={{ color: AppColors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
                {category.name}
              </Text>
            ) : null}
            <Text
              selectable
              numberOfLines={2}
              style={{
                color: AppColors.text,
                fontFamily: Fonts.serif,
                fontSize: 20,
                lineHeight: 25,
              }}>
              {article.title}
            </Text>
            <Text selectable numberOfLines={2} style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
              {article.summary}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={22} color={AppColors.mutedText} />
        </View>
      </Pressable>
    </Link>
  );
}
