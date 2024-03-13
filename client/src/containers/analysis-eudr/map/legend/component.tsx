import { useState } from 'react';
import classNames from 'classnames';
import { MinusIcon, PlusIcon } from '@heroicons/react/outline';

import LayersData from '../layers.json';

import LegendItem from './item';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SandwichIcon from '@/components/icons/sandwich';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EURDLegend = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const supplierPlotsData = LayersData.find((layer) => layer.id === 'suppliers-plot-of-land');
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
                title={supplierPlotsData.title}
                content={supplierPlotsData.content}
                description={supplierPlotsData.description}
                iconClassName={supplierPlotsData.legend.iconClassName}
                showVisibility
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
                    iconColor={layer.legend?.iconColor}
                    showSwitcher
                  />
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
