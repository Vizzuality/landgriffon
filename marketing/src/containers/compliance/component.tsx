import React, { useEffect } from 'react';

import Hero from 'containers/compliance/hero';
import Webinar from 'containers/compliance/webinar';
import DataProviders from 'containers/compliance/data-providers';

import ContactUs from 'containers/compliance/contact-us';
import SourcingModel from 'containers/compliance/sourcing-model';

import ScrollDown from 'containers/scroll-down';
import EUDRCompliance from './eudr-compliance/component';
import OpenScience from './open-science/component';

const Compliance: React.FC = () => {
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
      <Webinar />

      <EUDRCompliance />
      <SourcingModel />
      <DataProviders />
      <OpenScience />

      <ContactUs />
    </>
  );
};

export default Compliance;
