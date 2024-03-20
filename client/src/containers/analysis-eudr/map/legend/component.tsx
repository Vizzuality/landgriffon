import { useState } from 'react';
import classNames from 'classnames';
import { MinusIcon, PlusIcon } from '@heroicons/react/outline';

import LayersData from '../layers.json';

import LegendItem from './item';
import RADDSlider from './radd-slider';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setContextualLayer, setSupplierLayer } from '@/store/features/eudr';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SandwichIcon from '@/components/icons/sandwich';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EURDLegend = () => {
  const dispatch = useAppDispatch();
  const { supplierLayer, contextualLayers } = useAppSelector((state) => state.eudr);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // const supplierPlotsData = LayersData.find((layer) => layer.id === 'suppliers-plot-of-land');
  const PDAData = LayersData.find((layer) => layer.title === 'Plots with deforestation alerts');
  const DFPData = LayersData.find((layer) => layer.title === 'Deforestation-free plots');
  const contextualLayersData = LayersData.filter((layer) => layer.type === 'contextual');

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={classNames(
              'relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 p-1.5 text-black transition-colors hover:text-navy-400',
              isOpen ? 'bg-navy-400 text-white hover:text-white' : 'bg-white',
            )}
          >
            <SandwichIcon />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="left" className="p-0">
          <div className="divide-y">
            <h2 className="px-4 py-2 text-sm font-normal">Legend</h2>
            <div>
              <LegendItem
                title={DFPData.title}
                content={DFPData.content}
                description={DFPData.description}
                legendConfig={DFPData.legend}
                showVisibility
                isActive={supplierLayer.active}
                changeVisibility={() =>
                  dispatch(setSupplierLayer({ ...supplierLayer, active: !supplierLayer.active }))
                }
                changeOpacity={(opacity) =>
                  dispatch(setSupplierLayer({ ...supplierLayer, opacity }))
                }
              />
            </div>
            <div>
              <LegendItem
                title={PDAData.title}
                content={PDAData.content}
                description={PDAData.description}
                showVisibility
                isActive={supplierLayer.active}
                changeVisibility={() =>
                  dispatch(setSupplierLayer({ ...supplierLayer, active: !supplierLayer.active }))
                }
                changeOpacity={(opacity) =>
                  dispatch(setSupplierLayer({ ...supplierLayer, opacity }))
                }
              />
            </div>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-end px-4 py-2">
                  <button type="button" className="flex items-center space-x-2">
                    <div className="text-xs text-navy-400">Add contextual layers</div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-400">
                      {isExpanded ? (
                        <MinusIcon className="h-4 w-4 text-white" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-navy-50">
                {contextualLayersData.map((layer) => (
                  <LegendItem
                    key={`legend-item-${layer.id}`}
                    title={layer.title}
                    description={layer.description}
                    source={layer.source}
                    content={layer.content}
                    legendConfig={layer.legend}
                    showSwitcher
                    isActive={contextualLayers[layer.id].active}
                    changeVisibility={(isVisible) =>
                      dispatch(
                        setContextualLayer({
                          layer: layer.id,
                          configuration: { active: isVisible },
                        }),
                      )
                    }
                    changeOpacity={(opacity) =>
                      dispatch(
                        setContextualLayer({
                          layer: layer.id,
                          configuration: { opacity },
                        }),
                      )
                    }
                  >
                    <>
                      {layer.id === 'deforestation-alerts-2020-2022-hansen' &&
                        contextualLayers[layer.id].active && (
                          <div className="space-y-2">
                            <Slider
                              defaultValue={[2020]}
                              min={2020}
                              max={2022}
                              step={1}
                              className="mt-4"
                              onValueChange={(yearRange) =>
                                dispatch(
                                  setContextualLayer({
                                    layer: layer.id,
                                    configuration: { year: yearRange[0] },
                                  }),
                                )
                              }
                            />
                            <div className="flex justify-between">
                              {[2020, 2021, 2022].map((year) => (
                                <div key={year} className="text-2xs text-gray-500">
                                  {year}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {layer.id === 'real-time-deforestation-alerts-since-2020-radd' &&
                        contextualLayers[layer.id].active && <RADDSlider />}
                    </>
                  </LegendItem>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EURDLegend;
