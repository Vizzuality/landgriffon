import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';

import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';

import ButtonGroup, { LinkGroupItem } from 'components/button-group';

const MODES: string[] = ['map', 'table', 'chart'];

const ModeControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);

  return (
    <ButtonGroup>
      {MODES.map((mode) => (
        <LinkGroupItem key={mode} active={visualizationMode === mode} href={`/analysis/${mode}`}>
          {mode === 'map' && <MapIcon className="w-6 h-6" aria-hidden="true" />}
          {mode === 'table' && <TableIcon className="w-6 h-6" aria-hidden="true" />}
          {mode === 'chart' && <ChartPieIcon className="w-6 h-6" aria-hidden="true" />}
        </LinkGroupItem>
      ))}
    </ButtonGroup>
  );
};

export default ModeControl;
