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
            <input
              id="agree"
              name="agree"
              type="input"
              placeholder="Email address"
              className="w-full h-10 mr-3 text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
            />
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
            <label htmlFor="agree" className="block font-sans text-base text-black">
              <input
                id="agree"
                name="agree"
                type="radio"
                className="mr-3 text-black bg-transparent cursor-pointer w-7 h-7 border-darkGray border-px"
              />
              <p>
                By signing up here I agree to receive LandGriffon email newsletter.{' '}
                <a
                  className="underline cursor-pointer"
                  href="https://landgriffon.com/privacy-policy"
                >
                  Privacy statement.
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
