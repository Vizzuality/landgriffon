import React, { useEffect } from 'react';

import Hero from 'containers/repository/hero';
import DataProviders from 'containers/repository/data-providers';

import Resources from './resources';
import Newsletter from 'containers/newsletter';

const Repository: React.FC = () => {
  useEffect(() => {
    let timerId: number;

    if (window.location.hash && document.querySelector(window.location.hash)) {
      timerId = window.setTimeout(() => {
        document
          .querySelector(window.location.hash)
          .scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  return (
    <>
      <Hero />
      <Resources />
      <DataProviders />
      <Newsletter />
    </>
  );
};

export default Repository;
