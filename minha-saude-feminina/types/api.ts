export type ApiListResponse<T> = {
  data: T[];
};

export type ApiPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiPaginatedResponse<T> = {
  data: T[];
  pagination: ApiPagination;
};

export type ApiErrorBody = {
  error: true;
  message: string;
  code: string;
};

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  admin?: boolean;
};

export type AsyncResource<T> =
  | { status: 'idle'; data: T }
  | { status: 'loading'; data: T }
  | { status: 'success'; data: T }
  | { status: 'empty'; data: T }
  | { status: 'error'; data: T; message: string };
