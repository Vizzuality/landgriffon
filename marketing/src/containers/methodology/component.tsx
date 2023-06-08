import React, { useEffect } from 'react';

import Hero from 'containers/methodology/hero';
import StayUpToDate from 'containers/methodology/stay-up-to-date';
import DataProviders from 'containers/methodology/data-providers';

import Steps from 'containers/methodology/steps';
import Step01 from 'containers/methodology/steps/01';
import Step02 from 'containers/methodology/steps/02';
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

      <Steps>
        <Step01 />
        <Step02 />
      </Steps>

      <ContactUs />

      <KnowMore />

      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Methodology;
