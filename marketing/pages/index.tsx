import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Logo from 'components/logo';
import Banner from 'components/banner';
import Welcome from 'components/welcome';
import Newsletter from 'components/newsletter';
import EULogo from 'components/eu-logo';

const Home: React.FC = () => {
  return (
    <div className="lg:flex lg:items-stretch lg:h-screen bg-white">
      <Head>
        <title>Landgriffon - Welcome to the marketing site</title>
      </Head>

      <header className="p-6 flex justify-center items-start xl:justify-start lg:w-1/5">
        <Link href="/">
          <a>
            <Logo />
          </a>
        </Link>
      </header>

      <section className="lg:w-2/5 bg-yellow-500">
        <Banner />
      </section>

      <section className="lg:flex-grow p-6 md:p-20 bg-primary text-white flex flex-col justify-center">
        <Welcome />
        <Newsletter />
      </section>

      <footer className="lg:absolute lg:bottom-0 lg:left-0 lg:w-1/5 p-6 flex justify-center lg:justify-start">
        <EULogo />
      </footer>
    </div>
  );
};

export default Home;
