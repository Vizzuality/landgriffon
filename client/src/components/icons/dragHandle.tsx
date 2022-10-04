import type { SVGAttributes } from 'react';

const DragHandle = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <svg width="6" height="12" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="1" cy="1" r="1" />
      <circle cx="5" cy="1" r="1" />
      <circle cx="1" cy="6" r="1" />
      <circle cx="5" cy="6" r="1" />
      <circle cx="1" cy="11" r="1" />
      <circle cx="5" cy="11" r="1" />
    </svg>
  );
};

export default DragHandle;
