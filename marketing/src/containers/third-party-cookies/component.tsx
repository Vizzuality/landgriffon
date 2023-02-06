import React, { useEffect, useMemo } from 'react';
import Script from 'next/script';
import useCookie from 'react-use-cookie';

import useModal from 'hooks/modals';

import Cookies from 'components/cookies';

const ThirdParty: React.FC = () => {
  const [userConsent, setUserConsent] = useCookie('consent', undefined);

  const consent = useMemo(() => {
    if (userConsent === 'true') return true;
    if (userConsent === 'false') return false;
    return undefined;
  }, [userConsent]);

  const {
    isOpen: isOpenCookiesModal,
    open: openCookiesModal,
    close: closeCookiesModal,
  } = useModal();

  const handleCookieClick = (consent) => {
    setUserConsent(String(consent));
    closeCookiesModal();
  };

  useEffect(() => {
    if (!userConsent) {
      openCookiesModal();
    }
  }, [userConsent, openCookiesModal]);

  return (
    <>
      {consent && (
        <>
          <Script id="consent">{/* Third Party Script needing cookies */}</Script>
        </>
      )}
      <Cookies
        open={isOpenCookiesModal}
        onAccept={() => handleCookieClick(true)}
        onReject={() => handleCookieClick(false)}
      />
    </>
  );
};

export default ThirdParty;
