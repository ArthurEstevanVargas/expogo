import { useCallback, useEffect, useMemo, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { articleService } from '@/services/article-service';
import type { ApiPagination, AsyncResource } from '@/types/api';
import type { Article, ListArticlesParams } from '@/types/article';

type ArticlesState = AsyncResource<Article[]>;

export function useArticles(params: ListArticlesParams = {}, options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<ArticlesState>({ status: 'idle', data: [] });
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const requestParams = useMemo(() => JSON.parse(paramsKey) as ListArticlesParams, [paramsKey]);

  const load = useCallback(async () => {
    if (!enabled) {
      setState({ status: 'idle', data: [] });
      setPagination(null);
      return;
    }

    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const response = await articleService.list(requestParams);

      setPagination(response.pagination);
      setState({
        status: response.data.length > 0 ? 'success' : 'empty',
        data: response.data,
      });
    } catch (error) {
      setPagination(null);
      setState({
        status: 'error',
        data: [],
        message: getUserFacingErrorMessage(error),
      });
    }
  }, [enabled, requestParams]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    pagination,
    retry: load,
  };
}
