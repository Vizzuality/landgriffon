import { ChevronRightIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';

type AccordionEntryProps = React.PropsWithChildren<{
  header: React.ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}>;

type AccordionProps =
  | {
      entries: AccordionEntryProps[];
    }
  | Required<React.PropsWithChildren>;

const AccordionEntry: React.FC<AccordionEntryProps> = ({
  header,
  children,
  expanded,
  onExpandedChange,
}) => {
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
      className={classNames('p-3', {
        'bg-gray-50': !localIsExpanded,
      })}
    >
      <div className="flex flex-row gap-2 cursor-pointer" onClick={toggleExpand}>
        <div className="my-auto h-fit">
          <ChevronRightIcon
            className={classNames('w-4 h-4  my-auto', { 'rotate-90': localIsExpanded })}
          />
        </div>
        <div className="flex-grow">{header}</div>
      </div>
      {localIsExpanded && <div>{children}</div>}
    </div>
  );
};

const AccordionRoot: React.FC<AccordionProps> = (props) => {
  return (
    <div className="divide-y">
      {'children' in props
        ? props.children
        : props.entries.map((entry, i) => <AccordionEntry key={i} {...entry} />)}
    </div>
  );
};

const Accordion = Object.assign(AccordionRoot, { Entry: AccordionEntry });

export default Accordion;
