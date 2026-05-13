import { useCallback, useEffect, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { ApiError } from '@/lib/http/api-client';
import { categoryService } from '@/services/category-service';
import type { AsyncResource } from '@/types/api';
import type { Category } from '@/types/category';

type CategoryState = AsyncResource<Category | null>;

export function useCategory(idOrSlug: string) {
  const [state, setState] = useState<CategoryState>({ status: 'idle', data: null });

  const load = useCallback(async () => {
    if (!idOrSlug) {
      setState({ status: 'empty', data: null });
      return;
    }

    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const category = await categoryService.getByIdOrSlug(idOrSlug);
      setState({ status: 'success', data: category });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setState({ status: 'empty', data: null });
        return;
      }

      setState({
        status: 'error',
        data: null,
        message: getUserFacingErrorMessage(error),
      });
    }
  }, [idOrSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}
