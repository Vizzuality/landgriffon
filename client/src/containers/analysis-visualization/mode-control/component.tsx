import { useCallback } from 'react';
import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisUI, setVisualizationMode } from 'store/features/analysis/ui';
import { analysisFilters } from 'store/features/analysis/filters';

import ButtonGroup, { ButtonGroupItem } from 'components/button-group';

const ModeControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer } = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const handleClick = useCallback(
    (mode) => {
      dispatch(setVisualizationMode(mode));
    },
    [dispatch],
  );

  if (layer !== 'impact' && visualizationMode !== 'map') return null;

  return (
    <ButtonGroup>
      <ButtonGroupItem active={visualizationMode === 'map'} onClick={() => handleClick('map')}>
        <MapIcon className="h-6 w-6" aria-hidden="true" />
      </ButtonGroupItem>
      <ButtonGroupItem active={visualizationMode === 'table'} onClick={() => handleClick('table')}>
        <TableIcon className="h-6 w-6" aria-hidden="true" />
      </ButtonGroupItem>
      <ButtonGroupItem active={visualizationMode === 'chart'} onClick={() => handleClick('chart')}>
        <ChartPieIcon className="h-6 w-6" aria-hidden="true" />
      </ButtonGroupItem>
    </ButtonGroup>
  );
};

export default ModeControl;
