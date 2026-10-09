import { useState, useMemo } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export function usePagination<T>(
  items: T[],
  initialPageSize = 10
): [T[], PaginationState, PaginationActions] {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const actions = {
    setPage: (newPage: number) => setPage(Math.max(1, Math.min(newPage, totalPages))),
    setPageSize: (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
    },
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToFirst: () => setPage(1),
    goToLast: () => setPage(totalPages),
  };

  const state = { page, pageSize, total };

  return [paginatedItems, state, actions];
}
