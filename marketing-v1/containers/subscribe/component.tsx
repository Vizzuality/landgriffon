import React from 'react';

import { Form, Field } from 'react-final-form';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const Subscribe: React.FC = () => (
  <section className="w-full py-12 font-sans xl:py-20 bg-orange" id="subscribe">
    <Wrapper>
      <div className="grid md:grid-cols-2 gap-10">
        <p className="text-3xl font-light">Be the first to hear about new releases and updates.</p>

        <Form
          initialValues={{
            email: '',
            agreement: null,
          }}
          onSubmit={(values) => {
            const { email } = values;
            console.info('Email to sign up', email);
          }}
        >
          {({ values, handleSubmit }) => (
            <form onSubmit={values.agreement && handleSubmit} className="space-y-10">
              <div className="flex items-center justify-between space-y-10 md:space-y-0 md:flex-row">
                <Field name="email" component="input">
                  {(fprops) => (
                    <input
                      id="email"
                      name="email"
                      type="input"
                      placeholder="Email address"
                      className="w-full h-10 mx-3.5 md:mx-0 md:mr-3 text-xl text-black placeholder-black bg-transparent border-b border-darkGray border-px"
                      onChange={fprops.input.onChange}
                    />
                  )}
                </Field>

                <Button
                  theme="secondary"
                  size="s"
                  className="box-border flex-shrink-0 w-full h-10 transition duration-500 ease-in-out md:ml-5 md:w-28"
                  onClick={() => values.agreement && handleSubmit(values)}
                >
                  Subscribe
                </Button>
              </div>
              <div className="flex items-center">
                <Field name="agreement" component="input" type="radio">
                  {(fprops) => (
                    <label
                      htmlFor="agree"
                      className="relative flex font-sans text-xs text-black md:text-base"
                    >
                      <input
                        id="agree"
                        name="agree"
                        type="checkbox"
                        value={values.agreement}
                        checked={values.agreement}
                        className="mr-3 bg-transparent rounded-full cursor-pointer w-7 h-7 border-darkGray border-px"
                        onChange={fprops.input.onChange}
                      />
                      <span className="checkbox-circle" />
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
                  )}
                </Field>
              </div>
            </form>
          )}
        </Form>
      </div>
    </Wrapper>
  </section>
);

export default Subscribe;
