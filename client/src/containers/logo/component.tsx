import Image from 'next/image';

import type { HTMLAttributes } from 'react';

const LandgriffonLogo: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props}>
    <Image src="/images/LG-logo.svg" width={50} height={50} alt="Landgriffon logo" />
  </div>
);

export default LandgriffonLogo;
