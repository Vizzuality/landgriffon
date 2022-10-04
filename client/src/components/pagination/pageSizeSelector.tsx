import type { SelectOption, SelectProps } from 'components/select';
import Select from 'components/select';
import { useCallback, useMemo } from 'react';

interface PageSizeSelectorProps {
  pageSize: number;
  onChange: (pageSize: number) => void;
  availableSizes?: number[];
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  onChange,
  availableSizes,
  pageSize,
}) => {
  const currentPageOption = useMemo<SelectOption<number>>(
    () => ({ label: `${pageSize}`, value: pageSize }),
    [pageSize],
  );
  const sizeOptions = useMemo(
    () => (availableSizes ?? [10, 20, 30]).map((size) => ({ label: `${size}`, value: size })),
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
