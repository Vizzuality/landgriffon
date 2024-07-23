import Image from 'next/image';
import Link from 'next/link';
import { useScrollDirection } from 'react-use-scroll-direction';
import { motion, useViewportScroll } from 'framer-motion';

import dynamic from 'next/dynamic';

import Icon from 'components/icon';

import BURGER_SVG from 'svgs/ui/burger.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { useMemo, useRef, useState } from 'react';

const Nav = dynamic(() => import('./nav'), {
  ssr: false,
});

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { scrollDirection } = useScrollDirection();
  const prevDirection = useRef<string | number>(0);
  const { scrollY } = useViewportScroll();

  const scrollYPixels = scrollY.get() > 80;
  const directionY = useMemo(() => {
    switch (scrollDirection) {
      case 'UP':
        prevDirection.current = 0;
        return 0;
      case 'DOWN':
        if (scrollYPixels) {
          prevDirection.current = '-100%';
          return '-100%';
        }
        prevDirection.current = 0;
        return 0;
      default:
        return prevDirection.current;
    }
  }, [scrollDirection, scrollYPixels]);

  return (
    <>
      <div className="h-14 lg:h-20" />
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: directionY }}
        transition={{ duration: 0.25, bounce: 0 }}
        className="fixed top-0 left-0 z-50 flex items-center justify-between w-full font-semibold bg-white"
      >
        <div className="px-4 lg:px-12 shrink-0 flex items-center">
          <Link href="/">
            <a className="block w-[323px] h-[80px] py-6">
              <Image
                src="/images/logo.svg"
                alt="Landgriffon"
                width={323}
                height={30}
                priority
                layout="responsive"
              />
            </a>
          </Link>
        </div>

        <button
          type="button"
          className="block px-4 h-14 lg:hidden"
          onClick={() => {
            setOpen(!open);
          }}
        >
          {!open && <Icon icon={BURGER_SVG} className="w-6 h-6" />}
          {open && <Icon icon={CLOSE_SVG} className="w-5 h-5" />}
        </button>

        <Nav open={open} />
      </motion.header>
    </>
  );
};

export default Header;
