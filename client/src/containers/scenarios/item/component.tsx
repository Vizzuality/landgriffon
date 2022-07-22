import { Fragment, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Popover, RadioGroup, Switch, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import Link from 'next/link';

import {
  setCurrentScenario,
  scenarios,
  setComparisonEnabled,
} from 'store/features/analysis/scenarios';
import { analysisUI } from 'store/features/analysis/ui';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import ScenariosComparison from 'containers/scenarios/comparison';
import { useDeleteScenario } from 'hooks/scenarios';
import { ACTUAL_DATA } from '../constants';

import type { ErrorResponse } from 'types';
import type { Scenario } from '../types';
import { offset, useFloating } from '@floating-ui/react-dom';

type ScenariosItemProps = {
  data: Scenario;
  isComparisonAvailable: boolean;
  isSelected: boolean;
};

const DROPDOWN_BUTTON_CLASSNAME =
  'w-8 h-8 inline-flex items-center justify-center text-gray-900 rounded-full bg-transparent hover:text-green-800';
const DROPDOWN_ITEM_CLASSNAME =
  'block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 hover:text-gray-900';

const ScenariosList: React.FC<ScenariosItemProps> = (props: ScenariosItemProps) => {
  const dispatch = useAppDispatch();
  const { currentScenario, isComparisonEnabled } = useAppSelector(scenarios);
  const { visualizationMode } = useAppSelector(analysisUI);

  const { x, y, reference, floating, strategy } = useFloating({
    placement: 'right',
    middleware: [offset({ mainAxis: 10 })],
  });

  const { data, isSelected, isComparisonAvailable } = props;

  const deleteScenario = useDeleteScenario();

  const handleDelete = useCallback(() => {
    deleteScenario.mutate(data.id, {
      onSuccess: () => {
        if (currentScenario === data.id) dispatch(setCurrentScenario(ACTUAL_DATA.id));
        toast.success('Scenario successfully deleted.');
      },
      onError: (error: ErrorResponse) => {
        const { errors } = error.response?.data;
        errors.forEach(({ title }) => toast.error(title));
      },
    });
  }, [deleteScenario, data.id, currentScenario, dispatch]);

  // const handleShare = useCallback(() => {
  //   console.log('published scenarios');
  // }, []);

  useEffect(() => {
    // Disabling comparison when is not selected
    if (!isSelected) dispatch(setComparisonEnabled(false));
  }, [dispatch, isSelected]);

  // TO - DO remove this condition when scenarios analysis is available to show in the ma
  // Option to select a different scenario for map view disabled temporarily
  const disabledScenarios = visualizationMode === 'map';

  return (
    <li className="col-span-1 last-of-type:mb-6">
      <div
        className={classNames(
          'rounded-md border',
          isSelected ? 'border-primary' : 'border-gray-300',
        )}
      >
        <div className="flex items-center">
          <RadioGroup.Option
            disabled={disabledScenarios}
            key={data.id}
            value={data}
            className="flex justify-between flex-1 truncate items-top"
          >
            {({ checked }) => (
              <>
                <div className="flex justify-center flex-shrink-0 w-10 py-4 items-top">
                  {/* TO DO - remove this condition when scenarios analysis is available to show in the map*/}
                  {((disabledScenarios && data.id === ACTUAL_DATA.id) || !disabledScenarios) && (
                    <span
                      className={classNames(
                        checked ? 'bg-primary border-transparent' : 'bg-white border-gray-200',
                        'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                      )}
                      aria-hidden="true"
                    >
                      <span className="rounded-full bg-white w-1.5 h-1.5" />
                    </span>
                  )}
                </div>
                <div className="flex-1 py-4 pr-4 truncate space-y-2">
                  <h2
                    className={classNames(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-primary' : 'text-gray-900',
                    )}
                  >
                    {data.title}
                  </h2>
                  {data.id !== ACTUAL_DATA.id && (
                    <div className="flex">
                      <div className="bg-yellow text-xs px-2 rounded-full">
                        {data.scenarioInterventions.length} interventions
                      </div>
                    </div>
                  )}
                  <div>
                    {data.id === ACTUAL_DATA.id && (
                      <span className="text-sm text-gray-500">Based on your uploaded data</span>
                    )}
                    {data.id !== ACTUAL_DATA.id && data.updatedAt && (
                      <span className="text-gray-400 text-xs">{`Last edited ${format(
                        new Date(data.updatedAt),
                        'yyyy/MM/dd',
                      )}`}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </RadioGroup.Option>
          {data.id !== ACTUAL_DATA.id && (
            <div className="flex-shrink-0 pr-2">
              <Popover as="div" className="relative inline-block text-left">
                {({ open }) => (
                  <>
                    <div>
                      <Popover.Button ref={reference} className={DROPDOWN_BUTTON_CLASSNAME}>
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                      </Popover.Button>
                    </div>

                    {open &&
                      createPortal(
                        <Popover.Panel
                          ref={floating}
                          style={{
                            position: strategy,
                            top: y ?? '',
                            left: x ?? '',
                          }}
                          static
                          className="z-10 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <Transition
                            show={open}
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <div className="py-1">
                              <div>
                                <Link href={`/admin/scenarios/${data.id}/edit`}>
                                  <a
                                    className={classNames('text-gray-700', DROPDOWN_ITEM_CLASSNAME)}
                                  >
                                    Edit
                                  </a>
                                </Link>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className={classNames('text-gray-700', DROPDOWN_ITEM_CLASSNAME)}
                                  onClick={handleDelete}
                                >
                                  Delete
                                </button>
                              </div>
                              {/* <div>
                                <button
                                  type="button"
                                  className={classNames('text-gray-700', DROPDOWN_ITEM_CLASSNAME)}
                                  onClick={handleShare}
                                >
                                  Shared
                                </button>
                              </div> */}
                            </div>
                          </Transition>
                        </Popover.Panel>,
                        document.body,
                      )}
                  </>
                )}
              </Popover>
            </div>
          )}
        </div>
        {data.id === ACTUAL_DATA.id && isComparisonAvailable && (
          <div className="p-4 border-t border-primary">
            <div className="flex justify-between">
              <label className="block text-sm">Compare with</label>
              <Switch
                checked={isComparisonEnabled}
                onChange={(isEnabled) => dispatch(setComparisonEnabled(isEnabled))}
                className="relative inline-flex items-center justify-center flex-shrink-0 w-8 h-4 rounded-full cursor-pointer group focus:outline-none"
              >
                <label className="sr-only">Comparison scenario setting</label>
                <span
                  aria-hidden="true"
                  className="absolute w-full h-full rounded-md pointer-events-none"
                />
                <span
                  aria-hidden="true"
                  className={classNames(
                    isComparisonEnabled ? 'bg-primary' : 'bg-gray-200',
                    'pointer-events-none absolute h-3 w-7 mx-auto rounded-full transition-colors ease-in-out duration-100',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={classNames(
                    isComparisonEnabled ? 'translate-x-4' : 'translate-x-0',
                    'pointer-events-none absolute left-0 inline-block h-4 w-4 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-100',
                  )}
                />
              </Switch>
            </div>
            <ScenariosComparison />
          </div>
        )}
      </div>
    </li>
  );
};

export default ScenariosList;
