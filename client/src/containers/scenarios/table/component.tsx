import classNames from 'classnames';

import ScenarioIntervention from '../scenario-items/interventions';
import ScenarioGrowthRate from '../scenario-items/growth-rate';
import ScenarioMakePublic from '../scenario-items/make-public';
import ScenarioActions from '../scenario-items/actions';

import Table from 'components/table';
import { usePermissions } from 'hooks/permissions';
import { Permission } from 'hooks/permissions/enums';

import type { ScenarioTableProps } from '../types';

export const ScenarioTable = ({ data, className, onDelete }: ScenarioTableProps) => {
  const { hasPermission } = usePermissions();

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
            cell: () => <ScenarioGrowthRate display="list" />,
          },
          {
            id: 'ssss',
            header: 'Access',
            cell: ({ row }) => {
              const canEditScenario = hasPermission(
                Permission.CAN_EDIT_SCENARIO,
                row.original?.user.id,
              );
              return (
                <ScenarioMakePublic
                  id={row.original.id}
                  display="list"
                  isPublic={row.original.isPublic}
                  canEditScenario={canEditScenario}
                />
              );
            },
          },
          {
            id: 'actions',
            header: '',
            align: 'right',
            size: 260,
            isSticky: 'right',
            cell: ({ row }) => {
              const canDeleteScenario = hasPermission(
                Permission.CAN_DELETE_SCENARIO,
                row.original?.user.id,
              );
              const canEditScenario = hasPermission(
                Permission.CAN_EDIT_SCENARIO,
                row.original?.user.id,
              );
              return (
                <ScenarioActions
                  canDeleteScenario={canDeleteScenario}
                  canEditScenario={canEditScenario}
                  scenarioId={row.original.id}
                  display="list"
                  setDeleteVisibility={() => onDelete(row.original.id)}
                />
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default ScenarioTable;
