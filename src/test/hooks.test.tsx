import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useClickOutside } from '@/hooks/useClickOutside';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilterSort } from '@/hooks/useFilterSort';
import { useInterval } from '@/hooks/useInterval';
import { useKeyPress } from '@/hooks/useKeyPress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'first' });
    act(() => vi.advanceTimersByTime(300));
    rerender({ value: 'second' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('initial');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('second');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => {
      result.current[1]('updated');
    });
    expect(localStorage.getItem('test-key')).toBe('"updated"');
    expect(result.current[0]).toBe('updated');
  });

  it('should handle complex objects', () => {
    const initial = { count: 0, name: 'test' };
    const { result } = renderHook(() => useLocalStorage('test-obj', initial));
    act(() => {
      result.current[1]({ count: 5, name: 'updated' });
    });
    expect(result.current[0]).toEqual({ count: 5, name: 'updated' });
  });

  it('should handle errors gracefully', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
    vi.restoreAllMocks();
  });
});

describe('useFilterSort', () => {
  const testData = [
    { id: 1, name: 'Apple', category: 'fruit', price: 10 },
    { id: 2, name: 'Banana', category: 'fruit', price: 5 },
    { id: 3, name: 'Carrot', category: 'vegetable', price: 3 },
    { id: 4, name: 'Date', category: 'fruit', price: 15 },
  ];

  it('should return all items initially', () => {
    const { result } = renderHook(() => useFilterSort(testData));
    expect(result.current.filteredItems).toEqual(testData);
  });

  it('should filter by search', () => {
    const { result } = renderHook(() =>
      useFilterSort(testData, {
        search: (item, query) => item.name.toLowerCase().includes(query.toLowerCase()),
      })
    );

    act(() => {
      result.current.setSearch('apple');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Apple');
  });

  it('should filter by category', () => {
    const { result } = renderHook(() =>
      useFilterSort(testData, {
        filters: {
          category: (item, value) => item.category === value,
        },
      })
    );

    act(() => {
      result.current.setFilter('category', 'vegetable');
    });
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Carrot');
  });

  it('should sort items', () => {
    const { result } = renderHook(() => useFilterSort(testData));

    act(() => {
      result.current.setSort({ field: 'price', direction: 'asc' });
    });
    expect(result.current.filteredItems[0].price).toBe(3);
    expect(result.current.filteredItems[3].price).toBe(15);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() =>
      useFilterSort(testData, {
        search: (item, query) => item.name.toLowerCase().includes(query.toLowerCase()),
      })
    );

    act(() => {
      result.current.setSearch('apple');
      result.current.clearFilters();
    });
    expect(result.current.filteredItems).toEqual(testData);
    expect(result.current.search).toBe('');
  });
});

describe('useModal', () => {
  it('should manage modal state', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useConfirmation', () => {
  it('should manage confirmation state', () => {
    const { result } = renderHook(() => useConfirmation());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.options).toBeNull();

    act(() => {
      result.current.confirm({ title: 'Test', message: 'Test message' });
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.options).toEqual({ title: 'Test', message: 'Test message' });
  });

  it('should handle confirm', async () => {
    const { result } = renderHook(() => useConfirmation());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.confirm({ title: 'Test', message: 'Test message' });
    });

    act(() => {
      result.current.handleConfirm();
    });

    await expect(promise).resolves.toBe(true);
    expect(result.current.isOpen).toBe(false);
  });

  it('should handle cancel', async () => {
    const { result } = renderHook(() => useConfirmation());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.confirm({ title: 'Test', message: 'Test message' });
    });

    act(() => {
      result.current.handleCancel();
    });

    await expect(promise).resolves.toBe(false);
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useToast', () => {
  it('should manage toast state', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.showToast('Test message', 'success');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should remove toast on dismiss', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test', 'info');
    });
    const id = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test 1', 'info');
      result.current.showToast('Test 2', 'warning');
    });
    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.clearToasts();
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const ref = { current: null as HTMLDivElement | null };

    const element = document.createElement('div');
    ref.current = element;
    document.body.appendChild(element);

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      // Use mousedown instead of click as the hook listens for mousedown
      outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).toHaveBeenCalled();

    document.body.removeChild(element);
    document.body.removeChild(outsideElement);
  });

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: null as HTMLDivElement | null };

    const element = document.createElement('div');
    ref.current = element;
    document.body.appendChild(element);

    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });
});

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute callback at interval', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should not execute when delay is null', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('should cleanup interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(2);

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('useMediaQuery', () => {
  it.skip('should return false initially', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });
});

describe('useKeyPress', () => {
  it('should call handler on key press', () => {
    const handler = vi.fn();
    renderHook(() => useKeyPress('Escape', handler));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(handler).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
