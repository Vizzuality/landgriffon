interface ListIconProps {
  className?: string;
}

const ListIcon: React.FC<ListIconProps> = ({ className = 'w-6 h-6' }: ListIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
    >
      <path
        d="M11 9H1C0.734784 9 0.48043 9.10536 0.292893 9.29289C0.105357 9.48043 0 9.73478 0 10C0 10.2652 0.105357 10.5196 0.292893 10.7071C0.48043 10.8946 0.734784 11 1 11H11C11.2652 11 11.5196 10.8946 11.7071 10.7071C11.8946 10.5196 12 10.2652 12 10C12 9.73478 11.8946 9.48043 11.7071 9.29289C11.5196 9.10536 11.2652 9 11 9Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M11 1H1C0.734784 1 0.48043 1.10536 0.292893 1.29289C0.105357 1.48043 0 1.73478 0 2C0 2.26522 0.105357 2.51957 0.292893 2.70711C0.48043 2.89464 0.734784 3 1 3H11C11.2652 3 11.5196 2.89464 11.7071 2.70711C11.8946 2.51957 12 2.26522 12 2C12 1.73478 11.8946 1.48043 11.7071 1.29289C11.5196 1.10536 11.2652 1 11 1Z"
        fillRule="evenodd"
      />
      <path
        d="M11 5H1C0.734784 5 0.48043 5.10536 0.292893 5.29289C0.105357 5.48043 0 5.73478 0 6C0 6.26522 0.105357 6.51957 0.292893 6.70711C0.48043 6.89464 0.734784 7 1 7H11C11.2652 7 11.5196 6.89464 11.7071 6.70711C11.8946 6.51957 12 6.26522 12 6C12 5.73478 11.8946 5.48043 11.7071 5.29289C11.5196 5.10536 11.2652 5 11 5Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default ListIcon;
