import Head from 'next/head';

const Home: React.FC = () => (
  <div>
    <Head>
      <title>Welcome</title>
    </Head>
    <h1 className="font-heading text-7xl bg-orange">LANDGRIFFON.</h1>

    <div className="w-96">
      <p className="font-sans text-xl font-semibold bg-white">
        We help companies become sustainable by understanding and planning strategies to manage
        environmental impacts and risks in food supply chains.{' '}
      </p>
    </div>
  </div>
);

export default Home;
