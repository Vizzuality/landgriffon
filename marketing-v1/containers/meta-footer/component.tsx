import React from 'react';

import Button from 'components/button';

export const MetaFooter = () => (
  <section className="flex justify-between w-full py-12 font-sans bg-orange">
    <p className="w-2/5">Be the first to hear about new releases and updates.</p>
    <form className="w-2/4">
      E-mail adress
      <Button
        theme="secondary"
        size="s"
        className="box-border flex-shrink-0 h-10 ml-5 w-28"
        onClick={() => console.info('Sign up')}
      >
        Sign up
      </Button>
    </form>
  </section>
);

export default MetaFooter;
