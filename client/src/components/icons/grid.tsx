interface GridIconProps {
  className?: string;
}

const GridIcon: React.FC<GridIconProps> = ({ className = 'w-6 h-6' }: GridIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
    >
      <g clip-path="url(#clip0_1870_162733)">
        <path
          d="M4.5 0H0.5C0.223858 0 0 0.223858 0 0.5V4.5C0 4.77614 0.223858 5 0.5 5H4.5C4.77614 5 5 4.77614 5 4.5V0.5C5 0.223858 4.77614 0 4.5 0Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path
          d="M11.5 0H7.5C7.22386 0 7 0.223858 7 0.5V4.5C7 4.77614 7.22386 5 7.5 5H11.5C11.7761 5 12 4.77614 12 4.5V0.5C12 0.223858 11.7761 0 11.5 0Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path
          d="M4.5 7H0.5C0.223858 7 0 7.22386 0 7.5V11.5C0 11.7761 0.223858 12 0.5 12H4.5C4.77614 12 5 11.7761 5 11.5V7.5C5 7.22386 4.77614 7 4.5 7Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path
          d="M11.5 7H7.5C7.22386 7 7 7.22386 7 7.5V11.5C7 11.7761 7.22386 12 7.5 12H11.5C11.7761 12 12 11.7761 12 11.5V7.5C12 7.22386 11.7761 7 11.5 7Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </g>
    </svg>
  );
};

export default GridIcon;
