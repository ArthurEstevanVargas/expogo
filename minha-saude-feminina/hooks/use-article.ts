import { useCallback, useEffect, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { ApiError } from '@/lib/http/api-client';
import { articleService } from '@/services/article-service';
import type { AsyncResource } from '@/types/api';
import type { Article } from '@/types/article';

type ArticleState = AsyncResource<Article | null>;

export function useArticle(id: string) {
  const [state, setState] = useState<ArticleState>({ status: 'idle', data: null });

  const load = useCallback(async () => {
    if (!id) {
      setState({ status: 'empty', data: null });
      return;
    }

    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const article = await articleService.getById(id);
      setState({ status: 'success', data: article });
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
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}
