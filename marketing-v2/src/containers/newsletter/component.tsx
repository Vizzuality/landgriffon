import cx from 'classnames';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Wrapper from 'containers/wrapper';
import { useCallback } from 'react';

const schema = yup.object().shape({
  email: yup.string().email().required(),
  terms: yup.bool().oneOf([true]).required(),
});

const NewsLetter: React.FC = () => {
  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const onSubmit = useCallback((data) => {
    console.log(data);
  }, []);

  return (
    <section className="overflow-hidden bg-orange-500 xl:overflow-visible xl:bg-white">
      <Wrapper>
        <div className="relative z-10 py-20 bg-orange-500 xl:-mt-10 xl:px-20 xl:-mx-20">
          <div>
            <h2 className="text-6xl font-black uppercase font-display">
              Be the first to hear about new releases and updates.
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-20">
              <div className="flex items-end justify-between space-x-10">
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
