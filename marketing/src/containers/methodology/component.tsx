import React, { useEffect } from 'react';

import Hero from 'containers/methodology/hero';
import StayUpToDate from 'containers/methodology/stay-up-to-date';
import DataProviders from 'containers/methodology/data-providers';

import ContactUs from 'containers/methodology/contact-us';
import SourcingModel from 'containers/methodology/sourcing-model';

import ScrollDown from 'containers/scroll-down';
import Regulations from './regulations/component';
import OpenScience from './open-science/component';

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

      <Regulations />
      <SourcingModel />
      <DataProviders />
      <OpenScience />

      <ContactUs />
    </>
  );
};

export default Methodology;
