import { apiRequest } from '@/lib/http/api-client';
import type { ApiListResponse } from '@/types/api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const categoryService = {
  list(): Promise<ApiListResponse<Category>> {
    return apiRequest<ApiListResponse<Category>>('/categories');
  },

  getByIdOrSlug(idOrSlug: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${encodeURIComponent(idOrSlug)}`);
  },

  create(payload: CreateCategoryRequest): Promise<Category> {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      admin: true,
      body: payload,
    });
  },

  update(id: string, payload: UpdateCategoryRequest): Promise<Category> {
    return apiRequest<Category>(`/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      admin: true,
      body: payload,
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      admin: true,
    });
  },
};
