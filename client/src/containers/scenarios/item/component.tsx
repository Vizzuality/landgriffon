import { Fragment, useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Popover, RadioGroup, Switch, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

import { setCurrentScenario, setMode, scenarios } from 'store/features/analysis/scenarios';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import ScenariosComparison from 'containers/scenarios/comparison';
import { useDeleteScenario } from 'hooks/scenarios';
import { ACTUAL_DATA } from '../constants';

import type { ErrorResponse } from 'types';
import type { Scenario } from '../types';

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
  const { currentScenario } = useAppSelector(scenarios);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
    strategy: 'absolute',
    modifiers: [
      {
        name: 'offset',

        options: {
          offset: [-20, 20],
        },
      },
    ],
  });

  const { data, isSelected, isComparisonAvailable } = props;
  const [isComparisonEnabled, setComparisonEnabled] = useState<boolean>(false);

  const handleEdit = useCallback(() => {
    dispatch(setCurrentScenario(data.id));
    dispatch(setMode('edit'));
  }, [dispatch, data.id]);

  const deleteScenario = useDeleteScenario();

  const handleDelete = useCallback(() => {
    deleteScenario.mutate(data.id, {
      onSuccess: () => {
        if (currentScenario === data.id) dispatch(setCurrentScenario(ACTUAL_DATA.id));
        toast.success('Scenario succesfully deleted.');
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
    if (!isSelected) setComparisonEnabled(false);
  }, [isSelected]);

  return (
    <li className="col-span-1">
      <div
        className={classNames(
          'rounded border',
          isSelected ? 'border-green-700 bg-green-50' : 'border-gray-200',
        )}
      >
        <div className="flex items-center">
          <RadioGroup.Option
            key={data.id}
            value={data}
            className="flex justify-between flex-1 truncate items-top"
          >
            {({ checked }) => (
              <>
                <div className="flex justify-center flex-shrink-0 w-10 py-4 items-top">
                  <span
                    className={classNames(
                      checked ? 'bg-green-700 border-transparent' : 'bg-white border-gray-200',
                      'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                </div>
                <div className="flex-1 py-4 pr-4 truncate">
                  <h2 className="text-sm font-medium text-gray-900 truncate">{data.title}</h2>
                  <div className="text-sm text-gray-600">
                    {data.id === ACTUAL_DATA.id && (
                      <span className="text-green-700">Based on your uploaded data</span>
                    )}
                    {data.id !== ACTUAL_DATA.id &&
                      data.updatedAt &&
                      `Last edited ${format(new Date(data.updatedAt), 'yyyy/MM/dd')}`}
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
                      <Popover.Button
                        ref={setReferenceElement}
                        className={DROPDOWN_BUTTON_CLASSNAME}
                      >
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                      </Popover.Button>
                    </div>

                    {open &&
                      createPortal(
                        <Popover.Panel
                          ref={setPopperElement}
                          style={styles.popper}
                          {...attributes.popper}
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
                                <button
                                  type="button"
                                  className={classNames('text-gray-700', DROPDOWN_ITEM_CLASSNAME)}
                                  onClick={handleEdit}
                                >
                                  Edit
                                </button>
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
        {isSelected && isComparisonAvailable && (
          <div className="p-4 border-t border-green-700">
            <div className="flex justify-between">
              <label className="block text-sm">Compare this scenario</label>
              <Switch
                checked={isComparisonEnabled}
                onChange={setComparisonEnabled}
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
                    isComparisonEnabled ? 'bg-green-700' : 'bg-gray-200',
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
            {<ScenariosComparison disabled={!isComparisonEnabled} />}
          </div>
        )}
      </div>
    </li>
  );
};

export default ScenariosList;
