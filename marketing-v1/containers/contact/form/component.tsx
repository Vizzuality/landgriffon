import React from 'react';

import { Form, Field } from 'react-final-form';

import { Media } from 'containers/media';
import Wrapper from 'containers/wrapper';

import Button from 'components/button';

const ContactForm: React.FC = () => (
  <section className="relative flex flex-col pt-20 font-sans font-semibold md:font-normal md:pt-24">
    <Wrapper>
      <h3 className="text-4xl md:text-7xl">Contact us</h3>

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
          <form onSubmit={values.agreement && handleSubmit}>
            <div className="flex pt-20 pb-20 xl:pb-48">
              <div className="flex flex-col space-y-10 lg:w-3/5">
                <div className="flex flex-col w-full space-y-10 md:space-y-0 md:space-x-5 md:flex-row">
                  <Field name="name" component="input">
                    {(fprops) => (
                      <label
                        className="text-xs uppercase md:w-1/2 text-lightGray font-sans-semibold"
                        htmlFor="name"
                      >
                        Name
                        <input
                          id="name"
                          name="name"
                          type="input"
                          placeholder="John"
                          className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>

                  <Field name="company" component="input">
                    {(fprops) => (
                      <label
                        className="text-xs uppercase md:w-1/2 text-lightGray font-sans-semibold"
                        htmlFor="company"
                      >
                        Company
                        <input
                          id="company"
                          name="company"
                          type="input"
                          placeholder="Super company"
                          className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                          onChange={fprops.input.onChange}
                        />
                      </label>
                    )}
                  </Field>
                </div>

                <Field name="email" component="input">
                  {(fprops) => (
                    <label
                      className="text-xs uppercase md:pr-3 md:w-1/2 text-lightGray font-sans-semibold"
                      htmlFor="email"
                    >
                      Email
                      <input
                        id="email"
                        name="email"
                        type="input"
                        placeholder="email@email.com"
                        className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                        onChange={fprops.input.onChange}
                      />
                    </label>
                  )}
                </Field>

                <Field name="subject" component="input">
                  {(fprops) => (
                    <label
                      className="text-xs uppercase md:pr-3 md:w-1/2 text-lightGray font-sans-semibold"
                      htmlFor="subject"
                    >
                      Subject
                      <input
                        id="subject"
                        name="subject"
                        type="input"
                        placeholder="Message subject"
                        className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                        onChange={fprops.input.onChange}
                      />
                    </label>
                  )}
                </Field>

                <Field name="message" component="input">
                  {(fprops) => (
                    <label
                      className="text-xs uppercase md:pr-3 md:w-1/2 text-lightGray font-sans-semibold"
                      htmlFor="message"
                    >
                      Message
                      <input
                        id="message"
                        name="message"
                        type="input"
                        placeholder="My message"
                        className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
                        onChange={fprops.input.onChange}
                      />
                    </label>
                  )}
                </Field>

                <div className="flex flex-col items-center justify-start pt-2 space-y-10 md:justify-betweenlg: md:flex-row md:space-y-0">
                  <div className="flex flex-row items-center">
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
              <Media greaterThanOrEqual="lg">
                <div className="absolute right-0 flex flex-col w-2/5 px-12 pt-24 space-y-12 text-xl pb-72 flex-end bg-bege">
                  <div className="flex flex-col space-y-2">
                    <p className="font-sans-semibold">Email us</p>
                    <p>hello@vizzuality.com</p>
                  </div>
                </div>
              </Media>
            </div>
          </form>
        )}
      </Form>
    </Wrapper>
  </section>
);

export default ContactForm;
