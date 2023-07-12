import type { InputProps } from 'components/forms/input/types';

export type SearchProps = Omit<InputProps, 'unit' | 'onChange' | 'defaultValue'> & {
  onChange?: (value: string) => void;
  searchQuery?: string;
  defaultValue?: string;
};
