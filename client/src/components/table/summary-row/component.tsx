import classNames from 'classnames';
import { times } from 'lodash';

import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import { SummaryRowProps } from './types';

const DEFAULT_CLASSNAMES =
  'text-gray-600 border-t border-gray-300 bg-gray-50 py-3 text-xs break-words font-bold';

const SummaryRow: React.FC<SummaryRowProps> = ({
  rowData,
  isFirstColumnSticky = true,
  firstProjectedYear,
  ...props
}: SummaryRowProps) => {
  const firstColumnKey = props.columns[0].key;
  console.log(firstProjectedYear, 'firstProjectedYear');
  return (
    <>
      {times(props.groupColumnsCount, (idx) => (
        <td
          key={`ka-empty-cell-${idx}`}
          className={classNames('ka-empty-cell', DEFAULT_CLASSNAMES)}
        />
      ))}

      {props.columns.map(({ key }) => {
        const isFirstColumn = key === firstColumnKey;

        if (!rowData[key]) {
          return <td key={key} className={classNames('ka-empty-cell', DEFAULT_CLASSNAMES)}></td>;
        }
        return (
          <td
            key={key}
            className={classNames(
              'ka-cell border-t border-gray-300 bg-gray-50',
              DEFAULT_CLASSNAMES,
              {
                uppercase: isFirstColumn,
                'text-center': !isFirstColumn,
                'sticky z-10 left-0': isFirstColumn && isFirstColumnSticky,
                'border-l border-dashed color-gray-200': firstProjectedYear === Number(key),
                'after:absolute after:opacity-100 after:-right-3 after:w-3 after:top-0 after:bottom-0 after:border-l after:border-gray-50 after:shadow-[12px_0_10px_-15px_inset_#c2c5c9]':
                  isFirstColumn && isFirstColumnSticky,
              },
            )}
          >
            {Number.isNaN(+rowData[key]) ? rowData[key] : BIG_NUMBER_FORMAT(rowData[key])}
          </td>
        );
      })}
    </>
  );
};

export default SummaryRow;
