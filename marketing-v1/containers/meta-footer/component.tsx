import React from 'react';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

export const MetaFooter = () => (
  <section className="w-full py-12 font-sans bg-orange">
    <Wrapper>
      <div className="flex justify-between">
        <p className="w-2/5 text-3xl">Be the first to hear about new releases and updates.</p>
        <form className="w-2/4 space-y-3 lg:pl-44">
          <div className="flex items-center justify-between">
            <p>E-mail adress</p>
            <Button
              theme="secondary"
              size="s"
              className="box-border flex-shrink-0 h-10 ml-5 w-28"
              onClick={() => console.info('Sign up')}
            >
              Sign up
            </Button>
          </div>
          <div className="flex items-center">
            <label htmlFor="agree" className="flex block font-sans text-base text-black">
              <input
                id="agree"
                name="agree"
                type="radio"
                className="mr-3 text-indigo-600 bg-transparent cursor-pointer w-7 h-7 border-darkGray border-px focus:ring-indigo-500"
              />
              <p>
                By signing up here I agree to receive LandGriffon email newsletter.{' '}
                <a
                  className="underline cursor-pointer"
                  href="https://landgriffon.com/privacy-policy"
                >
                  Privacy statement
                </a>
              </p>
            </label>
          </div>
        </form>
      </div>
    </Wrapper>
  </section>
);

export default MetaFooter;
