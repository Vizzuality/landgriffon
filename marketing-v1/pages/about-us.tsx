import Head from 'next/head';

import Header from 'containers/header';
import Wrapper from 'containers/wrapper';

const AboutUs: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>About Us</title>
      </Head>
      <Header />
      <h1 className="font-heading text-7xl bg-orange">About US.</h1>
    </Wrapper>
  </div>
);

export default AboutUs;
