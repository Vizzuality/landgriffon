import Image from 'next/image';

type LandgriffonLogoProps = {
  className?: string;
};

const LandgriffonLogo: React.FC<LandgriffonLogoProps> = ({ className }) => (
  <div className={className}>
    <Image src="/landgriffon-logo.svg" width="175" height="14" alt="Landgriffon logo" />
  </div>
);

export default LandgriffonLogo;
