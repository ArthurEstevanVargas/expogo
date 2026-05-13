import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { CategoryForm } from '@/components/category-form';
import { FeedbackBanner } from '@/components/feedback-banner';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useCategoryMutations } from '@/hooks/use-category-mutations';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export default function ManageCategoriesScreen() {
  const categories = useCategories();
  const mutations = useCategoryMutations();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  async function handleCreate(payload: CreateCategoryRequest | UpdateCategoryRequest) {
    await mutations.createCategory(payload as CreateCategoryRequest);
    await categories.retry();
  }

  async function handleUpdate(payload: CreateCategoryRequest | UpdateCategoryRequest) {
    if (!editingCategory) return;

    await mutations.updateCategory(editingCategory.id, payload);
    setEditingCategory(null);
    await categories.retry();
  }

  function requestDelete(category: Category) {
    Alert.alert('Excluir categoria', `Deseja excluir "${category.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void mutations.deleteCategory(category.id).then(() => categories.retry());
        },
      },
    ]);
  }

  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 32, lineHeight: 38 }}>
          Gerenciar categorias
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 15, lineHeight: 22 }}>
          Use apenas os campos suportados pelo contrato atual da API de categorias.
        </Text>
      </View>

      <FeedbackBanner type="success" message={mutations.message} />
      <FeedbackBanner type="error" message={mutations.error} />

      <View
        style={{
          gap: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 18,
          backgroundColor: AppColors.surface,
        }}>
        <SectionHeader title={editingCategory ? 'Editar categoria' : 'Nova categoria'} />
        <CategoryForm
          key={editingCategory?.id ?? 'create'}
          initialValue={editingCategory ?? undefined}
          submitLabel={editingCategory ? 'Atualizar categoria' : 'Criar categoria'}
          pending={mutations.pending}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
        />
        {editingCategory ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditingCategory(null)}
            style={({ pressed }) => ({
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: AppColors.border,
              opacity: pressed ? 0.72 : 1,
            })}>
            <Text style={{ color: AppColors.text, fontWeight: '800' }}>Cancelar edição</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Categorias cadastradas" />
        {categories.status === 'loading' ? (
          <StateView loading title="Carregando categorias..." />
        ) : categories.status === 'error' ? (
          <StateView title="Não foi possível carregar categorias" message={categories.message} actionLabel="Tentar novamente" onAction={() => void categories.retry()} />
        ) : categories.status === 'empty' ? (
          <StateView title="Nenhuma categoria cadastrada" message="Crie a primeira categoria pelo formulário acima." />
        ) : (
          <View style={{ gap: 10 }}>
            {categories.data.map((category) => (
              <View
                key={category.id}
                style={{
                  gap: 10,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: AppColors.border,
                  borderRadius: 16,
                  backgroundColor: AppColors.surface,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text selectable style={{ color: AppColors.text, fontSize: 17, fontWeight: '800' }}>
                      {category.name}
                    </Text>
                    <Text selectable style={{ color: AppColors.mutedText, fontSize: 13 }}>
                      {category.slug}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setEditingCategory(category)}
                      style={({ pressed }) => ({
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: AppColors.softLavender,
                        opacity: pressed ? 0.72 : 1,
                      })}>
                      <IconSymbol name="pencil" size={22} color={AppColors.lavender} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => requestDelete(category)}
                      style={({ pressed }) => ({
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: AppColors.softCoral,
                        opacity: pressed ? 0.72 : 1,
                      })}>
                      <IconSymbol name="trash.fill" size={22} color={AppColors.danger} />
                    </Pressable>
                  </View>
                </View>
                <Text selectable style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
                  {category.description}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}
