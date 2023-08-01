import type { InputProps } from 'components/forms/input/types';

export type SearchProps = Omit<InputProps, 'unit' | 'onChange' | 'defaultValue' | 'size'> & {
  onChange?: (value: string) => void;
  searchQuery?: string;
  defaultValue?: string;
  size?: 'sm' | 'base';
};
