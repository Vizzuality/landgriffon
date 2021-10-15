import Head from 'next/head';

import { motion } from 'framer-motion';

import ContactForm from 'containers/contact/form';
import Footer from 'containers/footer';
import Header from 'containers/header';
import Subscribe from 'containers/subscribe';

const Contact: React.FC = () => (
  <div>
    <Head>
      <title>Contact - Landgriffon</title>
    </Head>
    <Header />

    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ContactForm />
      <Subscribe />
    </motion.div>

    <Footer />
  </div>
);

export default Contact;
