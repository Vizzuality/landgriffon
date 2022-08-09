import cx from 'classnames';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';
import { useCallback, useState } from 'react';
import { useSaveContact } from 'hooks/contact';

import Icon from 'components/icon';
import Loading from 'components/loading';

import EMAIL_SVG from 'svgs/contact/icn_email.svg?sprite';
import LOCATION_SVG from 'svgs/contact/icn_location.svg?sprite';
import { useRouter } from 'next/router';

const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  company: yup.string().required(),
  topic: yup.string().required(),
  message: yup.string().required(),
  terms: yup.bool().oneOf([true]).required(),
});

const Contact: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { query } = useRouter();
  const { topic } = query;

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      company: '',
      topic: topic || '',
      message: '',
      terms: false,
    },
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const saveContactMutation = useSaveContact({});

  const onSubmit = useCallback(
    (data) => {
      setSubmitting(true);
      saveContactMutation.mutate(
        { data },
        {
          onSuccess: () => {
            setSubmitting(false);
            setSuccess(true);
          },
          onError: () => {
            setSubmitting(false);
          },
        },
      );
    },
    [saveContactMutation],
  );

  return (
    <section className="bg-white">
      <div className="relative z-10">
        <Wrapper>
          <div className="relative z-10 py-12 md:py-32">
            <div className="flex flex-col justify-between space-y-10 md:flex-row md:space-x-20 md:space-y-0">
              <div className="space-y-10 md:w-8/12">
                <h2 className="text-5xl font-black uppercase md:text-7xl font-display">
                  Thanks for your interest in landgriffon.
                </h2>
                <h3 className="text-3xl font-medium font-display">
                  Want to learn more about the LandGriffon services? Submit this form and our team
                  will contact you soon.
                </h3>
              </div>

              <div className="md:w-4/12">
                <ul className="space-y-5 md:space-y-10">
                  <li className="flex space-x-5">
                    <Icon icon={EMAIL_SVG} className="w-8 h-8 shrink-0" />

                    <div className="space-y-2.5">
                      <h4 className="font-bold">Email us</h4>
                      <p className="font-light">
                        <a
                          href="mailto:hello@landgriffon.com"
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          hello@landgriffon.com
                        </a>
                      </p>
                    </div>
                  </li>

                  <li className="flex space-x-5">
                    <Icon icon={LOCATION_SVG} className="w-8 h-8 shrink-0" />

                    <div className="space-y-2.5">
                      <h4 className="font-bold">Our location</h4>
                      <p className="font-light">Madrid, Spain</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Wrapper>

        <div
          className="bg-white bg-no-repeat md:pb-32"
          style={{
            backgroundImage: `url('/images/contact/image11_contact.jpg')`,
            backgroundSize: '100% auto',
            backgroundPosition: '50% 100px',
          }}
        >
          <Wrapper>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative p-10 space-y-10 bg-orange-500 md:p-20"
            >
              {submitting && (
                <div className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full bg-orange-500/50">
                  <Loading />
                </div>
              )}

              {success && (
                <div className="absolute top-0 left-0 z-20 flex flex-col items-center justify-center w-full h-full py-20 space-y-5 bg-orange-500 xl:px-20">
                  <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
                    Thank you
                  </h2>
                  <p className="text-xl font-light">We will be in touch soon.</p>

                  <div>
                    <button
                      type="button"
                      className="py-8 mt-5 font-semibold text-black bg-transparent border border-black px-14 hover:bg-black/10"
                      onClick={() => {
                        reset();
                        setSuccess(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-end justify-between space-y-10 md:flex-row md:space-x-10 md:space-y-0">
                <div className="w-full">
                  <label htmlFor="name" className="font-bold ">
                    First and last name
                  </label>
                  <input
                    id="name"
                    className={cx({
                      'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                        true,
                      'border-red-500': errors.name,
                    })}
                    placeholder="Write your name"
                    {...register('name')}
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="email" className="font-bold ">
                    Email adress
                  </label>
                  <input
                    id="email"
                    className={cx({
                      'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                        true,
                      'border-red-500': errors.email,
                    })}
                    placeholder="name@company.com"
                    {...register('email')}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end justify-between space-y-10 md:flex-row md:space-x-10 md:space-y-0">
                <div className="w-full">
                  <label htmlFor="company" className="font-bold ">
                    Company name
                  </label>
                  <input
                    id="company"
                    className={cx({
                      'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                        true,
                      'border-red-500': errors.company,
                    })}
                    placeholder="Write your company name"
                    {...register('company')}
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="topic" className="font-bold ">
                    In which topic are you interested in?
                  </label>
                  <select
                    id="topic"
                    className={cx({
                      'block w-full py-5 bg-transparent border-t-transparent border-l-transparent border-r-transparent  border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none focus:ring-0':
                        true,
                      'border-red-500': errors.topic,
                    })}
                    {...register('topic')}
                  >
                    <option value="">Select a topic</option>
                    <option value="demo">Request a demo</option>
                    <option value="support">Technical support</option>
                    <option value="contact">General contact</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between space-y-10 md:flex-row md:space-x-10 md:space-y-0">
                <div className="w-full">
                  <label htmlFor="message" className="font-bold ">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className={cx({
                      'block w-full py-5 px-0 bg-transparent appearance-none border-t-transparent border-l-transparent border-r-transparent border-b-2 border-b-black/20 placeholder:text-black/30 focus:outline-none':
                        true,
                      'border-red-500': errors.message,
                    })}
                    rows={4}
                    placeholder="Write your message..."
                    {...register('message')}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end justify-between space-y-10 md:flex-row md:space-x-10 md:space-y-0">
                <div className="flex items-center space-x-2.5">
                  <input
                    id="terms"
                    type="checkbox"
                    {...register('terms')}
                    className={cx({
                      'border-red-500': errors.terms,
                    })}
                  />

                  <label className="font-light" htmlFor="terms">
                    I agree with the LandGriffon&apos;s{' '}
                    <Link href="/privacy-policy">
                      <a className="font-semibold text-black underline">Privacy Policy</a>
                    </Link>{' '}
                  </label>
                </div>

                <button
                  type="submit"
                  className="py-8 font-semibold text-black bg-transparent border border-black px-14 hover:bg-black/10"
                >
                  Send message
                </button>
              </div>
            </form>
          </Wrapper>
        </div>
      </div>
    </section>
  );
};

export default Contact;
