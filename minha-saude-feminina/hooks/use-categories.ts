import { useCallback, useEffect, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { categoryService } from '@/services/category-service';
import type { AsyncResource } from '@/types/api';
import type { Category } from '@/types/category';

type CategoriesState = AsyncResource<Category[]>;

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({ status: 'idle', data: [] });

  const load = useCallback(async () => {
    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const response = await categoryService.list();

      setState({
        status: response.data.length > 0 ? 'success' : 'empty',
        data: response.data,
      });
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        message: getUserFacingErrorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}
