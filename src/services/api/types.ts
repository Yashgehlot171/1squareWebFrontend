export interface ApiMeta {
  requestId?: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  meta?: ApiMeta;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: unknown;
  meta?: ApiMeta;
  statusCode?: number;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
