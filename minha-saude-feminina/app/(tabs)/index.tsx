import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ArticleListItem } from '@/components/article-list-item';
import { CategoryCard } from '@/components/category-card';
import { FeaturedCard } from '@/components/featured-card';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { AppColors, Fonts } from '@/constants/theme';
import { useArticles } from '@/hooks/use-articles';
import { useCategories } from '@/hooks/use-categories';

export default function HomeScreen() {
  const categories = useCategories();
  const articles = useArticles({ page: 1, pageSize: 5 });
  const featured = articles.data[0];

  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text style={{ color: AppColors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
          Minha Saúde Feminina
        </Text>
        <Text
          selectable
          style={{
            color: AppColors.text,
            fontFamily: Fonts.serif,
            fontSize: 34,
            lineHeight: 40,
          }}>
          Informação confiável para você se cuidar.
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 16, lineHeight: 24 }}>
          Conteúdo de saúde da mulher em linguagem clara, organizado por fases da vida e temas de cuidado.
        </Text>
      </View>

      {articles.status === 'loading' && !featured ? (
        <StateView loading title="Carregando destaque..." />
      ) : featured ? (
        <FeaturedCard title={featured.title} summary={featured.summary} href={`/artigo/${featured.id}`} />
      ) : (
        <FeaturedCard
          title="Explore os temas de cuidado"
          summary="Os artigos aparecerão aqui assim que estiverem disponíveis na API."
        />
      )}

      <View style={{ gap: 12 }}>
        <SectionHeader
          title="Categorias"
          action={
            <Link href="/categorias">
              <Text style={{ color: AppColors.primary, fontWeight: '800' }}>Ver todas</Text>
            </Link>
          }
        />
        {categories.status === 'loading' ? (
          <StateView loading title="Carregando categorias..." />
        ) : categories.status === 'error' ? (
          <StateView title="Não foi possível carregar categorias" message={categories.message} actionLabel="Tentar novamente" onAction={() => void categories.retry()} />
        ) : categories.status === 'empty' ? (
          <StateView title="Nenhuma categoria encontrada" message="A API ainda não retornou categorias para exibição." />
        ) : (
          <View style={{ gap: 12 }}>
            {categories.data.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} href={`/categoria/${category.slug || category.id}`} />
            ))}
          </View>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Últimos conteúdos" />
        {articles.status === 'loading' && articles.data.length === 0 ? (
          <StateView loading title="Carregando artigos..." />
        ) : articles.status === 'error' ? (
          <StateView title="Não foi possível carregar artigos" message={articles.message} actionLabel="Tentar novamente" onAction={() => void articles.retry()} />
        ) : articles.status === 'empty' ? (
          <StateView title="Nenhum artigo publicado" message="Quando novos conteúdos estiverem disponíveis, eles aparecerão nesta lista." />
        ) : (
          <View style={{ gap: 10 }}>
            {articles.data.map((article) => (
              <ArticleListItem
                key={article.id}
                article={article}
                category={categories.data.find((category) => category.id === article.categoryId)}
                href={`/artigo/${article.id}`}
              />
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}
