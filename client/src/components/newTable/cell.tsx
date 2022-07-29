import type { CSSProperties } from 'react';
import { useMemo } from 'react';

interface CellProps {
  width?: number;
  maxWidth?: number;
}

const Cell: React.FC<React.PropsWithChildren<CellProps>> = ({ children, width, maxWidth }) => {
  const style: CSSProperties = useMemo(
    () => ({
      width,
      maxWidth,
    }),
    [width, maxWidth],
  );
  return (
    <div
      style={style}
      className="flex items-center justify-center w-full h-20 text-center truncate"
    >
      <div className="text-center truncate">{children || '-'}</div>
    </div>
  );
};

export const HeaderCell: React.FC = ({ children }) => {
  return (
    <div className="py-1 mx-5 my-auto text-xs text-left text-gray-500 uppercase">{children}</div>
  );
};

export default Cell;
