import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((res) => {
      setOptions(opts);
      setResolve(() => res);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolve?.(true);
    setIsOpen(false);
    setOptions(null);
    setResolve(null);
  }, [resolve]);

  const handleCancel = useCallback(() => {
    resolve?.(false);
    setIsOpen(false);
    setOptions(null);
    setResolve(null);
  }, [resolve]);

  return { isOpen, options, confirm, handleConfirm, handleCancel };
}
