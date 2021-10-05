import Head from 'next/head';

import { motion } from 'framer-motion';

import ContactForm from 'containers/contact/form';
import Footer from 'containers/footer';
import Header from 'containers/header';
import MetaFooter from 'containers/meta-footer';

const Contact: React.FC = () => (
  <div>
    <Head>
      <title>Contact</title>
    </Head>
    <Header />
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ContactForm />
    </motion.div>
    <MetaFooter />
    <Footer />
  </div>
);

export default Contact;
