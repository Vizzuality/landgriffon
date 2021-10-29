import React, { useCallback, useState } from 'react';

import { Form, Field } from 'react-final-form';

import Link from 'next/link';

import axios from 'axios';
import validate from 'validate.js';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const validationConstraints = {
  subEmail: { presence: { allowEmpty: false }, email: true },
  subAgreement: { presence: true, inclusion: { within: [true], message: 'is required' } },
};

const Subscribe: React.FC = () => {
  const [subscription, setSubscription] = useState({
    status: null,
    message: null,
  });

  const handleOnSubmit = useCallback((values) => {
    const { subEmail } = values;
    const data = {
      list_ids: ['1b704de4-643f-4531-b6cb-63fea0e6ad2a'],
      contacts: [
        {
          email: subEmail,
        },
      ],
    };
    axios
      .put('https://api.sendgrid.com/v3/marketing/contacts', data, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SENDGRID_API_KEY_SUBSCRIPTION}`,
        },
      })
      .then(() => {
        setSubscription({
          status: 'success',
          message: 'Thank you. Your subscription has been processed successfully.',
        });
      })
      .catch((error) => {
        setSubscription({
          status: 'error',
          message: error.message,
        });
      });
  }, []);

  return (
    <section className="w-full py-12 font-sans xl:py-20 bg-orange" id="subscribe">
      <Wrapper>
        <div className="grid md:grid-cols-2 gap-10">
          <p className="font-heading-4">Be the first to hear about new releases and updates.</p>
          {subscription.status === 'success' && (
            <div>
              <p>{subscription.message}</p>
            </div>
          )}
          {subscription.status !== 'success' && (
            <Form
              initialValues={{
                subEmail: null,
                subAgreement: null,
              }}
              onSubmit={handleOnSubmit}
              validate={(values) => {
                const validationResult = validate(values, validationConstraints);
                return validationResult;
              }}
            >
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {subscription.status === 'error' && (
                    <div className="text-sm text-red-600">
                      <p>{subscription.message}</p>
                    </div>
                  )}
                  <div className="md:flex justify-between space-y-10 md:space-y-0 md:flex-row">
                    <Field name="subEmail" component="input">
                      {({ input, meta }) => (
                        <div className="flex-1">
                          <input
                            {...input}
                            type="email"
                            placeholder="Email address"
                            className="bg-orange focus:ring-indigo-500 focus:border-black block w-full text-md lg:text-lg border-t-0 border-l-0 border-r-0 border-b border-black placeholder-darkGray"
                          />
                          {meta.error && meta.touched && (
                            <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                          )}
                        </div>
                      )}
                    </Field>

                    <Button
                      theme="secondary"
                      size="s"
                      className="box-border flex-shrink-0 w-full h-10 transition duration-500 ease-in-out md:ml-5 md:w-28"
                      type="submit"
                    >
                      Subscribe
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Field name="subAgreement" component="input" type="checkbox">
                      {({ input, meta }) => (
                        <div>
                          <label htmlFor={input.name} className="relative flex">
                            <div className="relative">
                              <input
                                {...input}
                                id={input.name}
                                type="checkbox"
                                className="mr-3 bg-transparent rounded-full cursor-pointer w-7 h-7 border-darkGray border-px"
                              />
                              <span className="checkbox-circle mt-0 pointer-events-none" />
                            </div>
                            <span>
                              By signing up here I agree to receive LandGriffon email newsletter.{' '}
                              <Link href="/privacy-policy">
                                <a className="underline cursor-pointer">Privacy statement.</a>
                              </Link>
                            </span>
                          </label>
                          {meta.error && meta.touched && (
                            <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                </form>
              )}
            </Form>
          )}
        </div>
      </Wrapper>
    </section>
  );
};

export default Subscribe;
