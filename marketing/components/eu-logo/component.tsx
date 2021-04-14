import React from 'react';
import Image from 'next/image';

const EULogo: React.FC = () => (
  <div className="flex max-w-xs space-x-2 lg:flex-col lg:space-y-2 2xl:flex-row">
    <div className="flex-shrink-0 flex items-center">
      <Image src="/EU-logo.png" width="62px" height="43px" alt="European Union Logo" />
    </div>
    <p className="flex-grow text-xs">
      This project has received funding from the
      European Union&apos;s Horizon 2020 research and
      innovation programme under grant agreement
      No 101004174
    </p>
  </div>
);

export default EULogo;
