import React, { useEffect } from 'react';

import Hero from 'containers/repository/hero';
import DataProviders from 'containers/repository/data-providers';

import ScrollDown from 'containers/scroll-down';
import Regulations from './regulations/component';
import Webinar from './webinar/component';
import DatasetReleases from './releases/component';
import Podcast from './podcast';
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
      <ScrollDown theme="light" />
      <Hero />

      <Regulations />
      <DatasetReleases />
      <Webinar />
      <Podcast />
      <DataProviders />
      <Newsletter />
    </>
  );
};

export default Repository;
