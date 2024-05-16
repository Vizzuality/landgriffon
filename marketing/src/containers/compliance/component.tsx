import React, { useEffect } from 'react';

import Hero from 'containers/compliance/hero';
import Video from 'containers/compliance/video';
import ContactUs from 'containers/compliance/contact-us';
import EUDRTool from 'containers/compliance/eudr-tool';

import EUDRCompliance from './eudr-compliance/component';
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
      <Hero />
      <Video />
      <EUDRCompliance />
      <EUDRTool />
      <ContactUs />
      <SBTNandTNFDOverview />
      <ScienceBasedTargets />
      <ImpactBeyondCompliance />
      <Footer />
    </>
  );
};

export default Compliance;
