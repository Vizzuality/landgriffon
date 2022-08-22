import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';

import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters } from 'store/features/analysis/filters';

import ButtonGroup, { ButtonGroupItem } from 'components/button-group';
import Link from 'next/link';

const ModeControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer } = useAppSelector(analysisFilters);

  if (layer !== 'impact' && visualizationMode !== 'map') return null;

  return (
    <ButtonGroup>
      <ButtonGroupItem active={visualizationMode === 'map'}>
        <Link href="/analysis/map" replace>
          <a>
            <MapIcon className="w-6 h-6" aria-hidden="true" />
          </a>
        </Link>
      </ButtonGroupItem>

      <ButtonGroupItem active={visualizationMode === 'table'}>
        <Link href="/analysis/table" replace>
          <a>
            <TableIcon className="w-6 h-6" aria-hidden="true" />
          </a>
        </Link>
      </ButtonGroupItem>

      <ButtonGroupItem active={visualizationMode === 'chart'}>
        <Link href="/analysis/chart" replace>
          <a>
            <ChartPieIcon className="w-6 h-6" aria-hidden="true" />
          </a>
        </Link>
      </ButtonGroupItem>
    </ButtonGroup>
  );
};

export default ModeControl;
