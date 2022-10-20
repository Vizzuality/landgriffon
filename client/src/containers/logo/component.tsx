import Image from 'next/image';

import type { HTMLAttributes } from 'react';

const LandgriffonLogo: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props}>
    <Image src="/landgriffon-icon.png" width="58" height="59" alt="Landgriffon logo" />
  </div>
);

export default LandgriffonLogo;
