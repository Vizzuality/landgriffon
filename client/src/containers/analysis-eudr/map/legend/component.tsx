import { useState } from 'react';
import classNames from 'classnames';

import SandwichIcon from 'components/icons/sandwich';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EURDLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={classNames(
              'relative flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 text-black transition-colors hover:text-navy-400',
            )}
          >
            <SandwichIcon />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="left">
          Place content for the popover here.
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EURDLegend;
