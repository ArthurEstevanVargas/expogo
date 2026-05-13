import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { AppColors, Fonts } from '@/constants/theme';
import { useArticle } from '@/hooks/use-article';
import { useCategory } from '@/hooks/use-category';

function ArticleContent({ content }: { content: string }) {
  return (
    <View style={{ gap: 14 }}>
      {content.split('\n').filter(Boolean).map((paragraph, index) => (
        <Text key={`${paragraph}-${index}`} selectable style={{ color: AppColors.text, fontSize: 17, lineHeight: 27 }}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const article = useArticle(id);
  const category = useCategory(article.data?.categoryId ?? '');

  if (article.status === 'loading') {
    return (
      <AppScreen>
        <StateView loading title="Carregando artigo..." />
      </AppScreen>
    );
  }

  if (article.status === 'error') {
    return (
      <AppScreen>
        <StateView
          title="Não foi possível carregar o artigo"
          message={article.message}
          actionLabel="Tentar novamente"
          onAction={() => void article.retry()}
        />
      </AppScreen>
    );
  }

  if (article.status === 'empty' || !article.data) {
    return (
      <AppScreen>
        <StateView title="Artigo não encontrado" message="O conteúdo pode ter sido removido ou ainda não está disponível." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text style={{ color: AppColors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
          {category.data?.name ?? 'Artigo'}
        </Text>
        <Text
          selectable
          style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 34, lineHeight: 40 }}>
          {article.data.title}
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 17, lineHeight: 25 }}>
          {article.data.summary}
        </Text>
      </View>

      <ArticleContent content={article.data.content} />

      {article.data.sources && article.data.sources.length > 0 ? (
        <View style={{ gap: 10 }}>
          <SectionHeader title="Fontes" />
          {article.data.sources.map((source, index) => (
            <View
              key={source.id ?? `${source.title}-${index}`}
              style={{
                gap: 4,
                padding: 14,
                borderWidth: 1,
                borderColor: AppColors.border,
                borderRadius: 14,
                backgroundColor: AppColors.surface,
              }}>
              {source.title ? (
                <Text selectable style={{ color: AppColors.text, fontSize: 15, fontWeight: '800' }}>
                  {source.title}
                </Text>
              ) : null}
              {source.description ? (
                <Text selectable style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
                  {source.description}
                </Text>
              ) : null}
              {source.url ? (
                <Text selectable style={{ color: AppColors.primary, fontSize: 14, lineHeight: 20 }}>
                  {source.url}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}
