import cx from 'classnames';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Wrapper from 'containers/wrapper';
import { useCallback, useState } from 'react';
import { useSaveNewsletter } from 'hooks/newsletter';
import Loading from 'components/loading';

const schema = yup.object().shape({
  email: yup.string().email().required(),
  terms: yup.bool().oneOf([true]).required(),
});

const NewsLetter: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const saveNewsLetterMutation = useSaveNewsletter({});

  const onSubmit = useCallback(
    (data) => {
      setSubmitting(true);
      saveNewsLetterMutation.mutate(
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
    [saveNewsLetterMutation],
  );

  return (
    <section className="overflow-hidden bg-orange-500 xl:overflow-visible xl:bg-white">
      <Wrapper>
        <div className="relative z-10 py-12 bg-orange-500 md:py-20 xl:-mt-10 xl:px-20 xl:-mx-20">
          {submitting && (
            <div className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full bg-orange-500/50">
              <Loading />
            </div>
          )}

          {success && (
            <div className="absolute top-0 left-0 z-20 flex flex-col items-center justify-center w-full h-full py-20 space-y-5 bg-orange-500 xl:px-20">
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

          <div>
            <h2 className="text-4xl font-black uppercase md:text-6xl font-display">
              Be the first to hear about new releases and updates.
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-20">
              <div className="flex flex-col space-y-5 md:flex-row md:items-end md:justify-between md:space-y-0 md:space-x-10">
                <div className="w-full">
                  <label htmlFor="email" className="font-bold ">
                    Email adress
                  </label>
                  <input
                    id="email"
                    className={cx({
                      'block w-full py-5 bg-transparent border-b border-black/20 placeholder:text-black/30 outline-none':
                        true,
                      'border-red-500': errors.email,
                    })}
                    placeholder="Introduce your email address"
                    {...register('email')}
                  />
                </div>
                <button
                  type="submit"
                  className="py-8 font-semibold text-white bg-black border border-black px-14 hover:bg-black/75"
                >
                  Subscribe
                </button>
              </div>
              <div className="flex items-center mt-5 space-x-2.5">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                  className={cx({
                    'border-red-500': errors.terms,
                  })}
                />
                <label className="font-light" htmlFor="terms">
                  By signing up here I agree to receive LandGriffon email newsletter.{' '}
                  <a className="underline">Privacy statement</a>
                </label>
              </div>
            </form>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default NewsLetter;
