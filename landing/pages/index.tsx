import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Logo from 'components/logo';
import Banner from 'components/banner';
import Welcome from 'components/welcome';
import Newsletter from 'components/newsletter';
import EULogo from 'components/eu-logo';

const Home: React.FC = () => (
  <div className="lg:flex lg:items-stretch lg:h-screen bg-white">
    <Head>
      <title>Landgriffon - Meet your supply chain sustainability targets</title>
    </Head>

    <header className="px-10 py-7 lg:p-10 flex justify-center items-start xl:justify-start lg:w-1/5">
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>
    </header>

    <section className="lg:w-2/5 bg-yellow-500">
      <Banner />
    </section>

    <section className="lg:w-2/5 lg:flex-grow p-10 md:p-20 bg-primary text-white flex flex-col justify-center">
      <Welcome />
      <Newsletter />
    </section>

    <footer className="lg:absolute lg:bottom-0 lg:left-0 lg:w-1/5 px-10 py-7 lg:p-10 flex justify-center lg:justify-start">
      <EULogo />
    </footer>
  </div>
);

export default Home;
