import Image from 'next/image';
import Link from 'next/link';

import Icon from 'components/icon';

import BURGER_SVG from 'svgs/ui/burger.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { useState } from 'react';

import Nav from './nav';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between font-semibold bg-white h-14 lg:h-20">
      <div className="px-4 lg:px-12 shrink-0">
        <Link href="/">
          <a className="block w-[180px] h-[14px]">
            <Image
              src="/images/logo.svg"
              alt="Landgriffon"
              width={180}
              height={14}
              priority
              layout="responsive"
            />
          </a>
        </Link>
      </div>

      <button
        type="button"
        className="block px-4 lg:hidden"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {!open && <Icon icon={BURGER_SVG} className="w-6 h-6" />}
        {open && <Icon icon={CLOSE_SVG} className="w-5 h-5" />}
      </button>

      <Nav open={open} />
    </header>
  );
};

export default Header;
