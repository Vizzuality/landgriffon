import classNames from 'classnames';

import ScenarioIntervention from '../scenario-items/interventions';
import ScenarioGrowthRate from '../scenario-items/growth-rate';
import ScenarioMakePublic from '../scenario-items/make-public';
import ScenarioActions from '../scenario-items/actions';

import Table from 'components/table';

import type { ScenarioTableProps } from '../types';

export const ScenarioTable = ({
  data,
  className,
  canDeleteScenario,
  canEditScenario,
  onDelete,
}: ScenarioTableProps) => {
  return (
    <div className={classNames('w-full h-full', className)}>
      <Table
        data={data}
        columns={[
          {
            id: 'title',
            header: 'Scenario',
            align: 'left',
            cell: ({ row }) => (
              <div>
                <div className="text-sm font-medium text-gray-900">{row.original.title}</div>
                <div className="text-sm text-gray-500">
                  {/* {format(row.original.updatedAt, 'DD MM YYYY')} */}
                </div>
              </div>
            ),
          },
          {
            id: 'id',
            header: 'Interventions',
            cell: ({ row }) => <ScenarioIntervention scenarioId={row.original.id} display="list" />,
          },
          {
            id: 'ss',
            header: 'Growth Rates',
            cell: ({ row }) => <ScenarioGrowthRate display="list" />,
          },
          {
            id: 'ssss',
            header: 'Access',
            cell: ({ row }) => (
              <ScenarioMakePublic
                id={row.original.id}
                display="list"
                isPublic={row.original.isPublic}
                canEditScenario={canEditScenario}
              />
            ),
          },
          {
            id: 'actions',
            header: '',
            align: 'right',
            size: 260,
            isSticky: 'right',
            cell: ({ row }) => (
              <ScenarioActions
                canDeleteScenario={canDeleteScenario}
                canEditScenario={canEditScenario}
                scenarioId={row.original.id}
                display="list"
                setDeleteVisibility={() => onDelete(row.original.id)}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default ScenarioTable;
