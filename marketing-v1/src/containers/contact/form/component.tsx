import React, { useCallback, useState } from 'react';

import { Form, Field } from 'react-final-form';

import classNames from 'classnames';

import Link from 'next/link';

import axios from 'axios';
import validate from 'validate.js';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const validationConstraints = {
  name: { presence: { allowEmpty: false } },
  email: { presence: { allowEmpty: false }, email: true },
  subject: { presence: { allowEmpty: false } },
  message: { presence: { allowEmpty: false } },
  agreement: { presence: true, inclusion: { within: [true], message: 'is required' } },
};

const labelClassName = 'block text-sm font-semibold text-lightGray';
const inputClassName =
  'focus:ring-indigo-500 focus:border-indigo-500 block w-full text-md lg:text-lg border-t-0 border-l-0 border-r-0 border-b border-b-darkGray placeholder-lightGray';

const ContactForm: React.FC = () => {
  const [contactSubmission, setContactSubmission] = useState({
    status: null,
    message: null,
  });

  const handleOnSubmit = useCallback((values) => {
    console.info('contact values', values);
    axios
      .post('/api/contact', values)
      .then(() => {
        setContactSubmission({
          status: 'success',
          message: 'Thank you. Your contact has been processed successfully.',
        });
      })
      .catch((error) => {
        setContactSubmission({
          status: 'error',
          message: error.response.data,
        });
      });
  }, []);

  return (
    <section className="mt-20 py-28">
      <Wrapper>
        <h3 className="font-heading-1 mb-28">Contact us</h3>

        <div className="grid md:grid-cols-3 gap-10">
          {contactSubmission.status === 'success' && (
            <div className="md:col-span-2">
              <p>{contactSubmission.message}</p>
            </div>
          )}
          {contactSubmission.status !== 'success' && (
            <Form
              initialValues={{
                name: null,
                company: null,
                email: null,
                subject: null,
                message: null,
                agreement: false,
              }}
              onSubmit={handleOnSubmit}
              validate={(values) => {
                const validationResult = validate(values, validationConstraints);
                return validationResult;
              }}
            >
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="md:col-span-2">
                  {contactSubmission.status === 'error' && (
                    <div className="text-sm text-red-600 space-y-5 mb-10">
                      {contactSubmission.message?.errors.map(({ message }) => (
                        <p>{message}</p>
                      ))}
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-5">
                      <Field name="name" component="input">
                        {({ input, meta }) => (
                          <div>
                            <label className={labelClassName} htmlFor={input.name}>
                              Name
                            </label>
                            <div className="mt-1 relative">
                              <input
                                {...input}
                                type="text"
                                placeholder="First and last name"
                                className={inputClassName}
                              />
                            </div>
                            {meta.error && meta.touched && (
                              <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="email" component="input">
                        {({ input, meta }) => (
                          <div>
                            <label className={labelClassName} htmlFor={input.name}>
                              Email address
                            </label>
                            <div className="mt-1 relative">
                              <input
                                {...input}
                                type="email"
                                placeholder="Email address"
                                className={inputClassName}
                              />
                            </div>
                            {meta.error && meta.touched && (
                              <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="subject" component="input">
                        {({ input, meta }) => (
                          <div>
                            <label className={labelClassName} htmlFor={input.name}>
                              Subject
                            </label>
                            <div className="mt-1 relative">
                              <input
                                {...input}
                                type="text"
                                placeholder="Subject"
                                className={inputClassName}
                              />
                            </div>
                            {meta.error && meta.touched && (
                              <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                            )}
                          </div>
                        )}
                      </Field>

                      <Field name="message" component="textarea">
                        {({ input, meta }) => (
                          <div>
                            <label className={labelClassName} htmlFor={input.name}>
                              Message
                            </label>
                            <div className="mt-1 relative">
                              <textarea
                                {...input}
                                placeholder="Your message here"
                                className={inputClassName}
                              />
                            </div>
                            {meta.error && meta.touched && (
                              <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    <div className="space-y-10">
                      <Field name="company" component="input">
                        {({ input, meta }) => (
                          <div>
                            <label className={labelClassName} htmlFor={input.name}>
                              Company
                            </label>
                            <div className="mt-1 relative">
                              <input
                                {...input}
                                type="text"
                                placeholder="Company"
                                className={inputClassName}
                              />
                            </div>
                            {meta.error && meta.touched && (
                              <p className="mt-2 text-sm text-red-600">{meta.error.join('. ')}</p>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <div className="space-y-10 md:space-y-0 md:flex justify-between">
                        <Field name="agreement" component="input" type="checkbox">
                          {({ input, meta }) => (
                            <div>
                              <label
                                htmlFor={input.name}
                                className={classNames(labelClassName, 'flex items-center')}
                              >
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
                                  I agree with the Landgriffon’s{' '}
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
                        <Button
                          theme="secondary"
                          size="s"
                          type="submit"
                          className="box-border flex-shrink-0 h-10 text-base transition duration-500 ease-in-out w-36 md:ml-5 md:w-28"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </Form>
          )}
          <div className="bg-beige py-28 px-10 space-y-10">
            <div className="space-y-2">
              <p className="text-lg font-semibold">Email us</p>
              <p className="text-lg ">
                <a href="mailto:hello@landgriffon.com">hello@landgriffon.com</a>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Our location</p>
              <p className="text-lg ">Madrid, Spain</p>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContactForm;
