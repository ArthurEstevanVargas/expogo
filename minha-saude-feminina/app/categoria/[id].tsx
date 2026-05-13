import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ArticleListItem } from '@/components/article-list-item';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { AppColors, Fonts } from '@/constants/theme';
import { useArticles } from '@/hooks/use-articles';
import { useCategory } from '@/hooks/use-category';

export default function CategoryDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const category = useCategory(id);
  const articles = useArticles(
    { page: 1, pageSize: 20, categoryId: category.data?.id },
    { enabled: category.status === 'success' && Boolean(category.data?.id) }
  );

  if (category.status === 'loading') {
    return (
      <AppScreen>
        <StateView loading title="Carregando categoria..." />
      </AppScreen>
    );
  }

  if (category.status === 'error') {
    return (
      <AppScreen>
        <StateView
          title="Não foi possível carregar a categoria"
          message={category.message}
          actionLabel="Tentar novamente"
          onAction={() => void category.retry()}
        />
      </AppScreen>
    );
  }

  if (category.status === 'empty' || !category.data) {
    return (
      <AppScreen>
        <StateView title="Categoria não encontrada" message="Confira se o endereço está correto e tente novamente." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text style={{ color: AppColors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
          Categoria
        </Text>
        <Text
          selectable
          style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 34, lineHeight: 40 }}>
          {category.data.name}
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 16, lineHeight: 24 }}>
          {category.data.description}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Artigos" />
        {articles.status === 'loading' ? (
          <StateView loading title="Carregando artigos..." />
        ) : articles.status === 'error' ? (
          <StateView title="Não foi possível carregar artigos" message={articles.message} actionLabel="Tentar novamente" onAction={() => void articles.retry()} />
        ) : articles.status === 'empty' ? (
          <StateView title="Nenhum artigo nesta categoria" message="Novos conteúdos aparecerão aqui quando forem publicados." />
        ) : (
          <View style={{ gap: 10 }}>
            {articles.data.map((article) => (
              <ArticleListItem key={article.id} article={article} category={category.data ?? undefined} href={`/artigo/${article.id}`} />
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}
