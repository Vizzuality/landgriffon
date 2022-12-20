import { FC, useCallback, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useSaveContactMethodologySendgrid } from 'hooks/methodology';
import { saveContactToSubscribersSpreadsheet } from 'utils/subscribers-spreadsheet';

import Wrapper from 'containers/wrapper';

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  terms: yup.bool().oneOf([true]).required(),
  newsletter: yup.bool(),
});

type SubSchema = yup.InferType<typeof schema>;

const StayUpToDate: FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<SubSchema>({
    resolver: yupResolver(schema),
  });

  const saveContactMethodologyMutation = useSaveContactMethodologySendgrid({});

  const { errors } = formState;

  const onSubmit = useCallback(
    (data: SubSchema) => {
      setSubmitting(true);
      //? adds user to spreadsheet only if the newsletter's checkbox is checked
      if (data.newsletter) {
        saveContactToSubscribersSpreadsheet({ ...data, form: 'methodology' });
      }
      saveContactMethodologyMutation.mutate(
        { data },
        {
          onSuccess: () => {
            setSuccess(true);
          },
          onSettled: () => {
            setSubmitting(false);
            reset();
          },
        },
      );
    },
    [saveContactMethodologyMutation, reset],
  );

  return (
    <section className="pb-12 bg-white xl:pb-48" id="stay-up-to-date">
      <Wrapper>
        {success && (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-5 bg-white">
            <h2 className="text-4xl font-black uppercase md:text-6xl font-display">Thank you</h2>
            <p className="text-xl font-light">We will be in touch soon.</p>

            <div>
              <button
                type="button"
                className="py-8 mt-5 font-semibold text-black bg-transparent border border-black px-14 hover:bg-black/10"
                onClick={() => setSuccess(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!success && (
          <>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-black uppercase font-display">
                Stay up to date
              </h3>
              <p className="text-2xl font-light">
                The methodology will be reviewed and updated on a regular basis.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-14">
                  <div className="flex flex-col space-y-6 md:grid-cols-3 md:gap-6 md:grid">
                    <div className="flex flex-col space-y-6 sm:col-span-2 lg:space-x-6 lg:flex-row lg:space-y-0">
                      <div className="flex-1">
                        <label htmlFor="name" className="font-bold ">
                          Your name
                        </label>

                        <input
                          id="name"
                          className={cx({
                            'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                              true,
                            'border-red-500': errors.name,
                          })}
                          placeholder="Enter your name here"
                          {...register('name')}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="email" className="font-bold ">
                          Your email address
                        </label>
                        <input
                          id="email"
                          className={cx({
                            'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                              true,
                            'border-red-500': errors.email,
                          })}
                          placeholder="Enter your email address here"
                          {...register('email')}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-4 font-semibold text-black bg-transparent border-2 border-black hover:bg-black/10"
                      disabled={submitting}
                    >
                      Update me
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-top space-x-2.5">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      {...register('terms')}
                      className={cx('w-5 h-5 border-2 border-black', {
                        'border-red-500': errors.terms,
                      })}
                    />
                    <label className="font-light" htmlFor="accept-terms">
                      I agree with LandGriffon&apos;s{' '}
                      <Link href="/privacy-policy">
                        <a className="font-semibold text-black underline">Privacy Policy</a>
                      </Link>{' '}
                      and to receive methodology updates by email.
                    </label>
                  </div>

                  <div className="flex items-top space-x-2.5">
                    <input
                      id="newsletter"
                      type="checkbox"
                      {...register('newsletter')}
                      className={cx('w-5 h-5 border-2 border-black', {
                        'border-red-500': errors.newsletter,
                      })}
                    />
                    <label className="font-light" htmlFor="newsletter">
                      Send me LandGriffon&apos;s general newsletter as well.
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </Wrapper>
    </section>
  );
};

export default StayUpToDate;
