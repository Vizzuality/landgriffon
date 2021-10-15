import React from 'react';

import { Form, Field } from 'react-final-form';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const labelClassName = 'block text-xs uppercase text-lightGray font-semibold';
const inputClassName =
  'w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px';

const ContactForm: React.FC = () => (
  <section className="mt-20 py-28">
    <Wrapper>
      <h3 className="text-4xl md:text-7xl mb-28">Contact us</h3>

      <div className="grid md:grid-cols-3 gap-10">
        <Form
          initialValues={{
            name: '',
            company: '',
            email: '',
            subject: '',
            message: '',
          }}
          onSubmit={(values) => {
            const { agreement, ...rest } = values;
            console.info('Form values with agreement', rest);
          }}
        >
          {({ values, handleSubmit }) => (
            <form onSubmit={values.agreement && handleSubmit} className="md:col-span-2">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-10">
                  <Field name="name" component="input">
                    {(fprops) => (
                      <label className={labelClassName} htmlFor="name">
                        Name
                        <input
                          id="name"
                          name="name"
                          type="input"
                          placeholder="John"
                          className={inputClassName}
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>

                  <Field name="email" component="input">
                    {(fprops) => (
                      <label className={labelClassName} htmlFor="email">
                        Email
                        <input
                          id="email"
                          name="email"
                          type="input"
                          placeholder="email@email.com"
                          className={inputClassName}
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>

                  <Field name="subject" component="input">
                    {(fprops) => (
                      <label className={labelClassName} htmlFor="subject">
                        Subject
                        <input
                          id="subject"
                          name="subject"
                          type="input"
                          placeholder="Message subject"
                          className={inputClassName}
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>

                  <Field name="message" component="input">
                    {(fprops) => (
                      <label className={labelClassName} htmlFor="message">
                        Message
                        <input
                          id="message"
                          name="message"
                          type="input"
                          placeholder="My message"
                          className={inputClassName}
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>
                </div>

                <div className="space-y-10">
                  <Field name="company" component="input">
                    {(fprops) => (
                      <label className={labelClassName} htmlFor="company">
                        Company
                        <input
                          id="company"
                          name="company"
                          type="input"
                          placeholder="Super company"
                          className={inputClassName}
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-10 md:space-y-0 md:flex justify-between">
                    <div className="flex items-center">
                      <Field name="agreement" component="input" type="radio">
                        {(fprops) => (
                          <label htmlFor="agree" className={labelClassName}>
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
                          </label>
                        )}
                      </Field>
                      <p className="text-base">
                        I agree with the Landgriffon’s{' '}
                        <a
                          className="underline cursor-pointer"
                          href="https://landgriffon.com/privacy-policy"
                        >
                          Privacy statement.
                        </a>
                      </p>
                    </div>
                    <Button
                      theme="secondary"
                      size="s"
                      className="box-border flex-shrink-0 h-10 text-base transition duration-500 ease-in-out w-36 md:ml-5 md:w-28"
                      onClick={() => values.agreement && handleSubmit(values)}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </Form>
        <div className="bg-beige py-28 px-10 space-y-10">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Email us</p>
            <p className="text-lg ">hello@vizzuality.com</p>
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

export default ContactForm;
