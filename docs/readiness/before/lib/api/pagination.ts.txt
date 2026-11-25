export interface PageRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  genre?: string;
  year?: number;
  sort?: string;
  cursor?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  nextCursor?: string;
}

export function emptyPage<T>(pageSize = 24): Page<T> {
  return { items: [], page: 1, pageSize, total: 0 };
}
