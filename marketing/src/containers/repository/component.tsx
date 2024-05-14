import React, { useEffect } from 'react';

import Hero from 'containers/repository/hero';
import DataProviders from 'containers/repository/data-providers';

import ContactUs from 'containers/repository/contact-us';
import SourcingModel from 'containers/repository/sourcing-model';
import WelcomeModal from 'containers/home/welcome-modal';

import ScrollDown from 'containers/scroll-down';
import Regulations from './regulations/component';
import DatasetReleases from './releases/component';
import OpenScience from './open-science/component';

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
      <SourcingModel />
      <DataProviders />
      <OpenScience />

      <ContactUs />
      <WelcomeModal />
    </>
  );
};

export default Repository;
