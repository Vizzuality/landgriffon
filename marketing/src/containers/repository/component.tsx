import React, { useEffect } from 'react';

import Newsletter from 'containers/newsletter';
import ScrollDown from 'containers/scroll-down';

import Hero from './hero';
import Resources from './resources';
import DiscoverOurJourney from './discover-our-journey';

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
      <Resources />
      <DiscoverOurJourney />
      <Newsletter />
    </>
  );
};

export default Repository;
