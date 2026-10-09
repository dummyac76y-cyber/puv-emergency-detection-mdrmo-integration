import { useMemo, useState } from 'react';

export interface FilterConfig<T> {
  search?: (item: T, query: string) => boolean;
  filters?: Record<string, (item: T, value: unknown) => boolean>;
}

export interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export function useFilterSort<T>(
  items: T[],
  filterConfig: FilterConfig<T> = {},
  initialFilters: Record<string, unknown> = {},
  initialSort: SortConfig<T> | null = null
) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters);
  const [sort, setSort] = useState<SortConfig<T> | null>(initialSort);

  const filteredItems = useMemo(() => {
    let result = items;

    if (search && filterConfig.search) {
      result = result.filter((item) => filterConfig.search!(item, search));
    }

    Object.entries(filters).forEach(([key, value]) => {
      const filterFn = filterConfig.filters?.[key];
      if (value !== 'all' && value !== '' && filterFn) {
        result = result.filter((item) => filterFn(item, value));
      }
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, search, filters, sort, filterConfig]);

  const setFilter = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters(initialFilters);
  };

  const toggleSort = (field: keyof T) => {
    setSort((prev) =>
      prev?.field === field && prev.direction === 'asc'
        ? { field, direction: 'desc' }
        : { field, direction: 'asc' }
    );
  };

  return {
    filteredItems,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    sort,
    setSort,
    toggleSort,
  };
}
