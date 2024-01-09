import { ChevronRightIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { useCallback, useEffect, useState, useMemo } from 'react';

import type { HTMLAttributes } from 'react';

type AccordionEntryProps = React.PropsWithChildren<{
  header: React.ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}>;

type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  (
    | {
        children?: undefined;
        entries: AccordionEntryProps[];
      }
    | (Required<React.PropsWithChildren> & { entries?: undefined })
  );

const AccordionEntry = ({ header, children, expanded, onExpandedChange }: AccordionEntryProps) => {
  const [localIsExpanded, setLocalIsExpanded] = useState(expanded ?? false);

  useEffect(() => {
    if (expanded === undefined) {
      return;
    }
    setLocalIsExpanded(expanded);
  }, [expanded]);

  useEffect(() => {
    onExpandedChange?.(localIsExpanded);
  }, [localIsExpanded, onExpandedChange]);

  const toggleExpand = useCallback(() => {
    setLocalIsExpanded?.((expanded) => !expanded);
  }, []);

  return (
    <div
      className={classNames('rounded-lg border border-gray-200', {
        'shadow-md': localIsExpanded,
        'shadow-sm': !localIsExpanded,
      })}
    >
      <div
        className="flex cursor-pointer flex-row place-items-start gap-2 p-2"
        onClick={toggleExpand}
      >
        <div className="h-fit">
          <ChevronRightIcon
            className={classNames('my-auto h-5 w-5 text-gray-500', {
              'rotate-90': localIsExpanded,
            })}
          />
        </div>
        <div className="flex-grow">{header}</div>
      </div>
      {localIsExpanded && <div className="pb-2">{children}</div>}
    </div>
  );
};

const Accordion = ({ entries, children, className, ...props }: AccordionProps) => {
  const childToRender = useMemo(
    () =>
      children === undefined
        ? entries.map((entry, i) => <AccordionEntry key={i} {...entry} />)
        : children,
    [children, entries],
  );

  return (
    <div className={classNames(className, 'flex flex-col gap-2')} {...props}>
      {childToRender}
    </div>
  );
};

Accordion.Entry = AccordionEntry;

export default Accordion;
