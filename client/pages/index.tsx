import Head from 'next/head';

const Home: React.FC = () => (
  <div>
    <Head>
      <title>Welcome</title>
    </Head>
    <h1>Welcome to Vizzuality Front End scaffold project.</h1>
    <p>Remember to edit:</p>
    <ul>
      <li>package.json</li>
      <li>pages/app.js</li>
      <li>now.json (Vercel)</li>
    </ul>
  </div>
);

export default Home;
