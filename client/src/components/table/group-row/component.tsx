import classNames from 'classnames';
import { updateGroupsExpanded } from 'ka-table/actionCreators';

import type { GroupRowProps } from './types';

const GroupRow: React.FC<GroupRowProps> = ({
  dispatch,
  contentColSpan,
  isExpanded,
  text,
  groupKey,
  sticky: isSticky,
}: GroupRowProps) => (
  <>
    <td
      className="ka-empty-cell bg-gray-50 cursor-pointer border-t border-b"
      colSpan={1}
      onClick={() => dispatch(updateGroupsExpanded(groupKey))}
    ></td>
    <td
      className={classNames('bg-gray-50 left-0 cursor-pointer border-t border-b', {
        'sticky z-10 after:absolute after:opacity-100 after:-right-3 after:w-3 after:top-0 after:bottom-0 after:border-l after:border-gray-50 after:shadow-[12px_0_10px_-15px_inset_#c2c5c9]':
          isSticky,
      })}
      colSpan={1}
      onClick={() => dispatch(updateGroupsExpanded(groupKey))}
    >
      <div className="flex items-center">
        <div
          className={classNames('ka-icon ka-icon-group-arrow cursor-pointer', {
            'ka-icon-group-arrow-expanded': isExpanded,
            'ka-icon-group-arrow-collapsed': !isExpanded,
          })}
        />
        <div>{text}</div>
      </div>
    </td>
    <td
      className="cursor-pointer border-t border-b"
      colSpan={contentColSpan - 2}
      onClick={() => dispatch(updateGroupsExpanded(groupKey))}
    ></td>
  </>
);

export default GroupRow;
