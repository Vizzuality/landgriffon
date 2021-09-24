import Head from 'next/head';

import Header from 'containers/header';
import Wrapper from 'containers/wrapper';

const Home: React.FC = () => (
  <div>
    <Wrapper>
      <Head>
        <title>Welcome</title>
      </Head>
      <Header />
      <h1 className="font-heading text-7xl bg-orange">LANDGRIFFON.</h1>

      <div className="w-96">
        <p className="font-sans text-xl font-semibold bg-white">
          We help companies become sustainable by understanding and planning strategies to manage
          environmental impacts and risks in food supply chains.{' '}
        </p>
      </div>
    </Wrapper>
  </div>
);

export default Home;
