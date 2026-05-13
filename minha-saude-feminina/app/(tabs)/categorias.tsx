import { View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { CategoryCard } from '@/components/category-card';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { useCategories } from '@/hooks/use-categories';

export default function CategoriesScreen() {
  const categories = useCategories();

  return (
    <AppScreen>
      <SectionHeader title="Categorias" />
      {categories.status === 'loading' ? (
        <StateView loading title="Carregando categorias..." />
      ) : categories.status === 'error' ? (
        <StateView title="Não foi possível carregar categorias" message={categories.message} actionLabel="Tentar novamente" onAction={() => void categories.retry()} />
      ) : categories.status === 'empty' ? (
        <StateView title="Nenhuma categoria encontrada" message="A API ainda não retornou categorias para exibição." />
      ) : (
        <View style={{ gap: 12 }}>
          {categories.data.map((category) => (
            <CategoryCard key={category.id} category={category} href={`/categoria/${category.slug || category.id}`} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}
