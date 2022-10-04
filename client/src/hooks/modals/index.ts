import { useState } from 'react';

import type { UseModalProps } from './types';

export function useModal(): UseModalProps {
  const [isOpen, setIsOpen] = useState(false);

  const open = (): void => {
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  return {
    isOpen,
    open,
    close,
  };
}

export default useModal;
