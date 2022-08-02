import Image from 'next/image';
import type { HTMLAttributes } from 'react';

const LandgriffonLogo: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props}>
    <Image src="/landgriffon-logo-white.svg" width="196" height="16" alt="Landgriffon logo" />
  </div>
);

export default LandgriffonLogo;
