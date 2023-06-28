import React, { useEffect } from 'react';

import Hero from 'containers/methodology/hero';
import StayUpToDate from 'containers/methodology/stay-up-to-date';
import DataProviders from 'containers/methodology/data-providers';

import ContactUs from 'containers/methodology/contact-us';
import KnowMore from 'containers/methodology/know-more';

import Testimonials from 'containers/testimonials';
import Newsletter from 'containers/newsletter';
import ScrollDown from 'containers/scroll-down';

const Methodology: React.FC = () => {
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
      <StayUpToDate />
      <DataProviders />

      <ContactUs />

      <KnowMore />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Methodology;
