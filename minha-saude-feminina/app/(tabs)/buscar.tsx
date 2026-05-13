import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ArticleListItem } from '@/components/article-list-item';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { AppColors } from '@/constants/theme';
import { useArticles } from '@/hooks/use-articles';
import { useCategories } from '@/hooks/use-categories';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const categories = useCategories();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const hasQuery = debouncedQuery.length > 0;
  const articles = useArticles(
    { page: 1, pageSize: 20, q: debouncedQuery, search: debouncedQuery },
    { enabled: hasQuery }
  );

  return (
    <AppScreen>
      <SectionHeader title="Buscar" />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Digite uma palavra ou tema"
        placeholderTextColor={AppColors.mutedText}
        returnKeyType="search"
        style={{
          minHeight: 50,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 16,
          padding: 14,
          backgroundColor: AppColors.surface,
          color: AppColors.text,
          fontSize: 16,
        }}
      />

      {!hasQuery ? (
        <StateView title="Busque por um tema" message="Você pode procurar por ciclo, prevenção, gravidez, menopausa e outros assuntos." />
      ) : articles.status === 'loading' && articles.data.length === 0 ? (
        <StateView loading title="Buscando conteúdos..." />
      ) : articles.status === 'error' ? (
        <StateView title="Não foi possível buscar" message={articles.message} actionLabel="Tentar novamente" onAction={() => void articles.retry()} />
      ) : articles.status === 'empty' ? (
        <StateView title="Nenhum resultado encontrado" message={`Não encontramos artigos para "${debouncedQuery}".`} />
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
    </AppScreen>
  );
}
