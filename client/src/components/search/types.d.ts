import type { InputProps } from 'components/forms/input/types';

export type SearchProps = Omit<InputProps, 'unit' | 'onChange'> & {
  onChange: (value: string) => void;
};
