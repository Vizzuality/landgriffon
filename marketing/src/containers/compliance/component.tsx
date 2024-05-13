import React, { useEffect } from 'react';

import Hero from 'containers/compliance/hero';
import Video from 'containers/compliance/video';

import ContactUs from 'containers/compliance/contact-us';
import EUDRTool from 'containers/compliance/eudr-tool';

import ScrollDown from 'containers/scroll-down';
import EUDRCompliance from './eudr-compliance/component';
import OpenScience from './open-science/component';
import ScienceBasedTargets from './science-based-targets';
import SBTNandTNFDOverview from './sbtn-and-tnfd-overview';
import ImpactBeyondCompliance from './impact-beyond-compliance';
import Footer from './footer';

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
      <Video />

      <EUDRCompliance />
      <EUDRTool />
      <OpenScience />

      <ContactUs />
      <SBTNandTNFDOverview />
      <ScienceBasedTargets />
      <ImpactBeyondCompliance />
      <Footer />
    </>
  );
};

export default Compliance;
