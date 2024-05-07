import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';

import { useAppSelector, useSyncIndicators } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import ButtonGroup, { LinkGroupItem } from 'components/button-group';

const MODES = ['map', 'table', 'chart'] as const;

const ModeControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { query } = useRouter();
  const [syncedIndicators] = useSyncIndicators();
  const { detail, ...restQuery } = query;

  return (
    <ButtonGroup>
      {MODES.map((mode) => (
        <LinkGroupItem
          key={mode}
          active={visualizationMode === mode}
          href={{
            pathname: `/analysis/${mode}`,
            query: {
              ...restQuery,
              ...(mode === 'map' && {
                ...(syncedIndicators?.length >= 1 && {
                  indicators: syncedIndicators?.[0],
                }),
              }),
              ...(mode === 'table' && {
                ...(syncedIndicators?.length === 1 && {
                  detail: syncedIndicators?.[0],
                }),
              }),
            },
          }}
          data-testid={`mode-control-${mode}`}
        >
          {mode === 'map' && <MapIcon className="h-6 w-6" aria-hidden="true" />}
          {mode === 'table' && <TableIcon className="h-6 w-6" aria-hidden="true" />}
          {mode === 'chart' && <ChartPieIcon className="h-6 w-6" aria-hidden="true" />}
        </LinkGroupItem>
      ))}
    </ButtonGroup>
  );
};

export default ModeControl;
