import React from 'react';

import { Form, Field } from 'react-final-form';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const MetaFooter: React.FC = () => (
  <section className="w-full py-12 font-sans bg-orange">
    <Wrapper>
      <div className="flex flex-col items-center justify-between space-y-6 md:px-16 md:flex-row">
        <p className="text-3xl font-semibold md:w-2/5 md:font-normal">
          Be the first to hear about new releases and updates.
        </p>
        <Form
          initialValues={{
            email: '',
          }}
          onSubmit={(values) => {
            const { email } = values;
            console.info('Email to sign up', email);
          }}
        >
          {({ values, handleSubmit }) => (
            <form
              onSubmit={values.agreement && handleSubmit}
              className="space-y-6 md:w-2/4 md:pl-44"
            >
              <div className="flex flex-col items-center justify-between space-y-6 md:space-y-0 md:flex-row">
                <Field name="email" component="input">
                  {(fprops) => (
                    <input
                      id="email"
                      name="email"
                      type="input"
                      placeholder="Email address"
                      className="w-full h-10 mx-3.5 md:mx-0 md:mr-3 text-xl text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                      onChange={fprops.input.onChange}
                    />
                  )}
                </Field>

                <Button
                  theme="secondary"
                  size="s"
                  className="box-border flex-shrink-0 w-full h-10 md:ml-5 md:w-28"
                  onClick={() => values.agreement && handleSubmit(values)}
                >
                  Sign up
                </Button>
              </div>
              <div className="flex items-center">
                <Field name="agreement" component="input" type="radio">
                  {(fprops) => (
                    <label
                      htmlFor="agree"
                      className="flex font-sans text-xs text-black md:text-base"
                    >
                      <input
                        id="agree"
                        name="agree"
                        type="radio"
                        className="mr-3 text-black bg-transparent cursor-pointer w-7 h-7 border-darkGray border-px"
                        onChange={fprops.input.onChange}
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

export default MetaFooter;
