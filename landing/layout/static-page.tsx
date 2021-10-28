import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Logo from 'components/logo';

type LayoutProps = {
  children: React.ReactChildren;
  title: string;
};

const StaticPage: React.FC = ({ children, title }: LayoutProps) => (
  <>
    <Head>
      <title>{`Landgriffon - ${title}`}</title>
    </Head>
    <header className="px-10 py-7 lg:p-10 flex justify-center items-start xl:justify-start lg:w-1/5">
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>
    </header>
    <div className="flex justify-center">
      <div className="max-w-screen-lg my-8 mx-4 prose">
        {children}
      </div>
    </div>
  </>
);

export default StaticPage;
