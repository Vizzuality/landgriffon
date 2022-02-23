import Image from 'next/image';

type LandgriffonLogoProps = {
  className?: string;
};

const LandgriffonLogo: React.FC<LandgriffonLogoProps> = ({ className }) => (
  <div className={className}>
    <Image src="/landgriffon-logo-white.svg" width="196" height="16" alt="Landgriffon logo" />
  </div>
);

export default LandgriffonLogo;
