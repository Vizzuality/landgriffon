import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';

interface CellProps {
  width?: number;
  maxWidth?: number;
  className?: string;
}

const Cell: React.FC<React.PropsWithChildren<CellProps>> = ({
  children,
  width,
  maxWidth,
  className,
}) => {
  const style: CSSProperties = useMemo(
    () => ({
      width,
      maxWidth,
    }),
    [width, maxWidth],
  );
  return (
    // aqui iba el pl-5
    <div
      style={style}
      className={classNames('flex items-center justify-start w-full h-20 truncate', className)}
    >
      <div className="w-full mx-auto truncate">{children || '-'}</div>
    </div>
  );
};

export const HeaderCell: React.FC<{ className?: string }> = ({ children, className }) => {
  return (
    <div
      className={classNames('py-1 my-auto text-xs text-left text-gray-500 uppercase', className)}
    >
      {children}
    </div>
  );
};

export default Cell;
