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
    <div>
      <Head>
        <title>Landgriffon - Welcome to the marketing site</title>
      </Head>

      <header>
        <Link href="/">
          <a>
            <Logo />
          </a>
        </Link>
      </header>

      <section>
        <Banner />
      </section>

      <section>
        <Welcome />
        <Newsletter />
      </section>

      <footer>
        <EULogo />
      </footer>
    </div>
  );
};

export default Home;
