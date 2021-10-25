import React from 'react';

import { motion, Transition } from 'framer-motion';

export interface SVGMotionProps {
  isOpen: boolean;
  color: string;
  strokeWidth: string | number;
  transition: Transition;
  lineProps?: Record<string, unknown>;
  height: number;
  width: number;
  className?: string;
  onClick: () => void;
}

const MenuButton: React.FC<SVGMotionProps> = ({
  isOpen,
  width,
  height,
  strokeWidth = 1,
  color,
  transition,
  lineProps,
  className,
  ...props
}: SVGMotionProps) => {
  const variant = isOpen ? 'opened' : 'closed';

  const top = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: 45,
      translateY: 2,
    },
  };
  const center = {
    closed: {
      opacity: 1,
    },
    opened: {
      opacity: 0,
    },
  };
  const bottom = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: -45,
      translateY: -2,
    },
  };
  const newLineProps = {
    stroke: color,
    strokeWidth: strokeWidth as number,
    vectorEffect: 'non-scaling-stroke',
    initial: 'closed',
    animate: variant,
    transition,
    ...lineProps,
  };
  const unitHeight = 4;
  const unitWidth = (unitHeight * (width as number)) / (height as number);

  return (
    <motion.svg
      viewBox={`0 0 ${unitWidth} ${unitHeight}`}
      overflow="visible"
      preserveAspectRatio="none"
      width={width}
      height={height}
      className={className}
      {...props}
    >
      <motion.line x1="0" x2={unitWidth} y1="0" y2="0" variants={top} {...newLineProps} />
      <motion.line x1="0" x2={unitWidth} y1="2" y2="2" variants={center} {...newLineProps} />
      <motion.line x1="0" x2={unitWidth} y1="4" y2="4" variants={bottom} {...newLineProps} />
    </motion.svg>
  );
};

export default MenuButton;
