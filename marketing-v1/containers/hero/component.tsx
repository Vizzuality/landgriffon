import React from 'react';

import Link from 'next/link';

export const Hero = () => (
  <section className="w-full row-auto pt-4 pb-5">
    <nav className="relative flex flex-wrap items-center justify-between mt-1 md:mt-0 navbar-expand-lg">
      <Link href="/">
        <h3 className="text-base tracking-widest cursor-pointer md:text-lg font-heading">
          01 Measure
        </h3>
      </Link>
      <Link href="/">
        <h3 className="text-base tracking-widest cursor-pointer md:text-lg font-heading">
          02 Analise
        </h3>
      </Link>
      <Link href="/">
        <h3 className="text-base tracking-widest cursor-pointer md:text-lg font-heading">
          03 Forecast
        </h3>
      </Link>
    </nav>
  </section>
);

export default Hero;
