import React, { useEffect, useMemo } from 'react';
import Script from 'next/script';
import useCookie from 'react-use-cookie';
import Link from 'next/link';

import useModal from 'hooks/modals';

import CookieModal from 'components/cookie-modal';
import Button from 'components/button';

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
      <CookieModal
        title="Cookie Policy"
        open={isOpenCookiesModal}
        onDismiss={closeCookiesModal}
        dismissable
      >
        <div className="lg:pt-4 lg:flex lg:flex-row lg:justify-between xl:pt-4 xl:flex xl:flex-row xl:justify-between">
          <p className="mt-1">
            This website uses cookies to ensure you get the best experience on our website. Read our
            <Link href="/privacy-policy">
              <a className="underline font-semibold text-black"> cookie policy</a>
            </Link>{' '}
            to know more.
          </p>
          <div className="flex justify-end gap-3 mt-1">
            <Button size="xs" theme="secondary" onClick={() => handleCookieClick(false)}>
              Deny all non essential cookies
            </Button>
            <Button size="xs" theme="primary" onClick={() => handleCookieClick(true)}>
              Accept all cookies
            </Button>
          </div>
        </div>
      </CookieModal>
    </>
  );
};

export default ThirdParty;
