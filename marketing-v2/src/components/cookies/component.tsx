import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import type { CookiesProps } from './types';

import Button from 'components/button';

export const CookieModal: React.FC<CookiesProps> = ({ open, onAccept, onReject }: CookiesProps) => {
  return (
    <AnimatePresence>
      {open && (
        <div>
          <motion.div
            initial={{
              opacity: 0,
              y: '100%',
            }}
            animate={{
              opacity: 1,
              y: '0%',
              transition: {
                delay: 0.125,
              },
            }}
            exit={{
              opacity: 0,
              y: '100%',
              transition: {
                delay: 0,
              },
            }}
            className="fixed bottom-0 left-0 z-50 w-full p-6 overflow-hidden transform translate-y-full bg-orange-500 outline-none"
          >
            <div className="flex flex-col space-y-5 lg:pt-4 lg:flex-row lg:justify-between lg:items-center lg:space-x-5 lg:space-y-0 xl:pt-4 xl:flex xl:flex-row xl:justify-between">
              <p className="text-base">
                This website uses cookies to ensure you get the best experience on our website. Read
                our{' '}
                <Link href="/privacy-policy">
                  <a className="font-semibold text-black underline">cookie policy</a>
                </Link>{' '}
                to know more.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  size="xl"
                  className="font-semibold text-black bg-orange-500 border border-black"
                  onClick={onReject}
                >
                  Deny all non essential cookies
                </Button>
                <Button size="xl" className="font-semibold text-white bg-black" onClick={onAccept}>
                  Accept all cookies
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CookieModal;
