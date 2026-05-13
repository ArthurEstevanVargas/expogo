import { useCallback, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { categoryService } from '@/services/category-service';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export function useCategoryMutations() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>, successMessage: string) => {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const result = await operation();
      setMessage(successMessage);
      return result;
    } catch (mutationError) {
      setError(getUserFacingErrorMessage(mutationError));
      throw mutationError;
    } finally {
      setPending(false);
    }
  }, []);

  return {
    pending,
    message,
    error,
    resetFeedback() {
      setMessage(null);
      setError(null);
    },
    createCategory(payload: CreateCategoryRequest): Promise<Category> {
      return runMutation(() => categoryService.create(payload), 'Categoria criada com sucesso.');
    },
    updateCategory(id: string, payload: UpdateCategoryRequest): Promise<Category> {
      return runMutation(() => categoryService.update(id, payload), 'Categoria atualizada com sucesso.');
    },
    deleteCategory(id: string): Promise<void> {
      return runMutation(() => categoryService.remove(id), 'Categoria excluida com sucesso.');
    },
  };
}
