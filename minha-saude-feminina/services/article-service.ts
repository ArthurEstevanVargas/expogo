import { apiRequest } from '@/lib/http/api-client';
import type { ApiPaginatedResponse } from '@/types/api';
import type { Article, ListArticlesParams } from '@/types/article';

function buildArticleQuery(params: ListArticlesParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.q) searchParams.set('q', params.q);
  if (params.search) searchParams.set('search', params.search);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export const articleService = {
  list(params: ListArticlesParams = {}): Promise<ApiPaginatedResponse<Article>> {
    return apiRequest<ApiPaginatedResponse<Article>>(`/articles${buildArticleQuery(params)}`);
  },

  getById(id: string): Promise<Article> {
    return apiRequest<Article>(`/articles/${encodeURIComponent(id)}`);
  },
};
