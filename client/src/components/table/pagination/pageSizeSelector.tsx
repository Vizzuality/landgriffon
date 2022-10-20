import { useCallback, useMemo } from 'react';

import { DEFAULT_PAGE_SIZES } from './constants';

import Select from 'components/select';

import type { SelectOption, SelectProps } from 'components/select';

interface PageSizeSelectorProps {
  pageSize: number;
  onChange: (pageSize: number) => void;
  availableSizes?: number[];
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  onChange,
  availableSizes = DEFAULT_PAGE_SIZES,
  pageSize,
}) => {
  const currentPageOption = useMemo<SelectOption<number>>(
    () => ({ label: `${pageSize}`, value: pageSize }),
    [pageSize],
  );
  const sizeOptions = useMemo(
    () => availableSizes.map((size) => ({ label: `${size}`, value: size })),
    [availableSizes],
  );

  const handleChange = useCallback<SelectProps<number>['onChange']>(
    (option) => {
      onChange(option.value as number);
    },
    [onChange],
  );

  return (
    <Select
      instanceId="page-selector"
      current={currentPageOption}
      options={sizeOptions}
      onChange={handleChange}
    />
  );
};

export default PageSizeSelector;
