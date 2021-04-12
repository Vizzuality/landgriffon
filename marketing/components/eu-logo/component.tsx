import React from 'react';

const EULogo: React.FC = () => (
  <div className="flex xl:flex-col items-center xl:items-start space-x-2 xl:space-x-0 xl:space-y-2 sm:max-w-xs xl:max-w-auto">
    <div className="flex-shrink-0">
      <img src="/EU-logo.png" width="62px" height="43px" alt="European Union Logo" />
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
