import { InterventionTypes } from 'containers/interventions/enums';

const VARIANTS = {
  default: {
    rect: {
      fill: '#ffa000',
      fillOpacity: '0.15',
    },
  },
  light: {
    rect: {
      fill: 'white',
    },
  },
};

type InterventionMaterialIconProps = {
  interventionType: InterventionTypes;
  variant?: keyof typeof VARIANTS;
};

const InterventionTypeIcon: React.FC<InterventionMaterialIconProps> = ({
  interventionType,
  variant = 'default',
}) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" rx="28" {...VARIANTS[variant].rect} />
    {interventionType === InterventionTypes.Material && (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.6402 39.3641C23.4237 39.3641 25.6801 37.1076 25.6801 34.3241C25.6801 31.5406 23.4237 29.2842 20.6402 29.2842C17.8567 29.2842 15.6002 31.5406 15.6002 34.3241C15.6002 37.1076 17.8567 39.3641 20.6402 39.3641Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.6799 34.3242V18.7843C25.682 17.3119 24.5945 16.0649 23.1354 15.8668C21.6763 15.6687 20.2957 16.5806 19.9052 18.0004L15.7803 32.9859"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M35.7599 39.3641C38.5434 39.3641 40.7999 37.1076 40.7999 34.3241C40.7999 31.5406 38.5434 29.2842 35.7599 29.2842C32.9764 29.2842 30.72 31.5406 30.72 34.3241C30.72 37.1076 32.9764 39.3641 35.7599 39.3641Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30.72 34.3242V18.7843C30.7178 17.3119 31.8053 16.0649 33.2644 15.8668C34.7235 15.6687 36.1041 16.5806 36.4947 18.0004L40.6196 32.9825"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.6801 24.2441H30.72V27.6041H25.6801V24.2441Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {interventionType === InterventionTypes.SupplierLocation && (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.6693 25.3337H18.6666C20.8758 25.3337 22.6666 27.1245 22.6666 29.3337V30.667C22.6666 31.4034 23.2636 32.0003 24 32.0003C26.2091 32.0003 28 33.7912 28 36.0003V38.667C28.9208 38.667 29.8143 38.5503 30.6666 38.3309V36.0003C30.6666 33.7912 32.4575 32.0003 34.6666 32.0003H37.8913C38.3913 30.7651 38.6666 29.4149 38.6666 28.0003C38.6666 26.5858 38.3913 25.2356 37.8913 24.0003L37.3333 24.0003C36.5969 24.0003 36 24.5973 36 25.3337C36 27.5428 34.2091 29.3337 32 29.3337C29.7908 29.3337 28 27.5428 28 25.3337C28 24.5973 27.403 24.0003 26.6666 24.0003H26C23.5337 24.0003 21.5142 22.0872 21.3448 19.664C19.567 21.0851 18.2537 23.0631 17.6693 25.3337ZM22.0742 16.0529C17.6838 18.2346 14.6666 22.7651 14.6666 28.0003C14.6666 35.3641 20.6362 41.3337 28 41.3337C35.3638 41.3337 41.3333 35.3641 41.3333 28.0003C41.3333 25.8722 40.8347 23.8604 39.9479 22.0756C39.9475 22.0748 39.9471 22.074 39.9467 22.0732C37.7647 17.6836 33.2346 14.667 28 14.667C25.8714 14.667 23.8592 15.1658 22.0742 16.0529ZM24 18.109V19.3337C24 20.4382 24.8954 21.3337 26 21.3337H26.6666C28.8758 21.3337 30.6666 23.1245 30.6666 25.3337C30.6666 26.07 31.2636 26.667 32 26.667C32.7363 26.667 33.3333 26.07 33.3333 25.3337C33.3333 23.4417 34.6468 21.8566 36.4116 21.4404C34.4594 18.9407 31.4174 17.3337 28 17.3337C26.5854 17.3337 25.2352 17.609 24 18.109ZM36.3271 34.667H34.6666C33.9302 34.667 33.3333 35.2639 33.3333 36.0003V37.24C34.4845 36.574 35.4998 35.6991 36.3271 34.667ZM25.3333 38.3309C20.7327 37.1468 17.3333 32.9706 17.3333 28.0003H18.6666C19.403 28.0003 20 28.5973 20 29.3337V30.667C20 32.8761 21.7908 34.667 24 34.667C24.7363 34.667 25.3333 35.2639 25.3333 36.0003V38.3309Z"
          fill="#FFA000"
        />
      </>
    )}
    {interventionType === InterventionTypes.Efficiency && (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.9786 21.5215C24.9786 24.5588 27.9786 27.0215 27.9786 27.0215C27.9786 27.0215 30.9786 24.5588 30.9786 21.5215C30.9786 18.4842 27.9786 16.0215 27.9786 16.0215C27.9786 16.0215 24.9786 18.4828 24.9786 21.5215Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.8426 25.1737C28.3173 27.6484 27.976 32.0004 27.976 32.0004C27.976 32.0004 23.6253 32.339 21.1493 29.867C18.6733 27.395 19.016 23.0404 19.016 23.0404C19.016 23.0404 23.3666 22.699 25.8426 25.1737Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.116 25.1737C27.6413 27.6484 27.9826 32.0004 27.9826 32.0004C27.9826 32.0004 32.3346 32.339 34.8093 29.867C37.284 27.395 36.9426 23.0404 36.9426 23.0404C36.9426 23.0404 32.592 22.699 30.116 25.1737Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.8426 34.1737C28.3173 36.6484 27.976 41.0004 27.976 41.0004C27.976 41.0004 23.6253 41.339 21.1493 38.867C18.6733 36.395 19.016 32.0404 19.016 32.0404C19.016 32.0404 23.3666 31.699 25.8426 34.1737Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.116 34.1737C27.6413 36.6484 27.9826 41.0004 27.9826 41.0004C27.9826 41.0004 32.3346 41.339 34.8093 38.867C37.284 36.395 36.9426 32.0404 36.9426 32.0404C36.9426 32.0404 32.592 31.699 30.116 34.1737Z"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.9786 41V43"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.016 23.0361V19.0361"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36.9426 23.0361V19.0361"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.9786 16.0215V13.0215"
          stroke="#FFA000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

export default InterventionTypeIcon;
