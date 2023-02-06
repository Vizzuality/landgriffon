import { useState } from 'react';

import type { UseModalProps } from './types';

export function useModal(defaultIsOpen = false): UseModalProps {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

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
