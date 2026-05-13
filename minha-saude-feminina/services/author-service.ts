import { apiRequest } from '@/lib/http/api-client';
import type { ApiListResponse } from '@/types/api';
import type { Author } from '@/types/author';

export const authorService = {
  list(): Promise<ApiListResponse<Author>> {
    return apiRequest<ApiListResponse<Author>>('/authors');
  },
};
