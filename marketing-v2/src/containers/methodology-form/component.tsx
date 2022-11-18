import cx from 'classnames';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';

import { useCallback, useState } from 'react';
import { useSaveContactMethodologySendgrid } from 'hooks/methodology';
import Loading from 'components/loading';
import { saveContactToSubscribersSpreadsheet } from 'utils/subscribers-spreadsheet';

const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  company: yup.string().required(),
  terms: yup.bool().oneOf([true]).required(),
  newsletter: yup.bool(),
});

const MethodologyForm: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const saveContactMethodologyMutation = useSaveContactMethodologySendgrid({});

  const onSubmit = useCallback(
    (data) => {
      console.log(data);
      setSubmitting(true);
      saveContactToSubscribersSpreadsheet({
        ...data,
        form: 'methodology',
        newsletter: data.newsletter ? 'Yes' : 'No',
      });
      saveContactMethodologyMutation.mutate(
        { data },
        {
          onSuccess: () => {
            setSubmitting(false);
          },
          onError: () => {
            setSubmitting(false);
          },
        },
      );
    },
    [saveContactMethodologyMutation],
  );

  return (
    <section className="flex flex-col -mx-6 overflow-hidden bg-white grow">
      <h2 className="px-6 font-bold md:px-14">
        {saveContactMethodologyMutation.isSuccess ? (
          <span>We have received your request</span>
        ) : (
          <span>To download our Methodology, please fill in the following fields</span>
        )}
      </h2>
      <div className="relative z-10 flex flex-col px-6 py-8 overflow-x-hidden overflow-y-auto md:py-10 grow md:px-14">
        {submitting && (
          <div className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full bg-blue-500/50">
            <Loading />
          </div>
        )}

        {saveContactMethodologyMutation.isSuccess && (
          <div>
            <p>
              Thank you for filling in your details! You&apos;ll receive a link to our methodology
              in your email inbox. If you can&apos;t see it, please check your spam folder.
            </p>
          </div>
        )}

        {!saveContactMethodologyMutation.isSuccess && (
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-14">
                  <div className="space-y-10">
                    <div className="w-full">
                      <label htmlFor="name" className="font-bold ">
                        Full name
                      </label>
                      <input
                        id="name"
                        className={cx({
                          'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                            true,
                          'border-red-500': errors.name,
                        })}
                        placeholder="Enter your first and last name here"
                        {...register('name')}
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="email" className="font-bold ">
                        Email
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

                    <div className="w-full">
                      <label htmlFor="company" className="font-bold ">
                        Name of company or organization
                      </label>
                      <input
                        id="company"
                        className={cx({
                          'block w-full py-5 bg-transparent border-b-2 border-black/20 placeholder:text-black/30 focus:outline-none':
                            true,
                          'border-red-500': errors.company,
                        })}
                        placeholder="Enter name here. If you’re downloading for personal interest, please write “personal”"
                        {...register('company')}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-100 p-7">
                    <div className="flex items-top mt-5 space-x-2.5">
                      <input
                        id="accept-terms"
                        type="checkbox"
                        {...register('terms')}
                        className={cx('w-5 h-5 border-2 border-black', {
                          'border-red-500': errors.terms,
                        })}
                      />
                      <label className="font-light" htmlFor="accept-terms">
                        I agree with LandGriffon’s{' '}
                        <Link href="/privacy-policy">
                          <a className="font-semibold text-black underline">Privacy Policy.</a>
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-top mt-5 space-x-2.5">
                      <input
                        id="newsletter"
                        type="checkbox"
                        {...register('newsletter')}
                        className={cx('w-5 h-5 border-2 border-black', {
                          'border-red-500': errors.newsletter,
                        })}
                      />
                      <label className="font-light" htmlFor="newsletter">
                        I want to be added to the LandGriffon mailing list for occasional updates
                        through the email newsletter.
                      </label>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-5 py-4 font-semibold text-black bg-transparent border-2 border-black hover:bg-black/10"
                        disabled={submitting}
                      >
                        Send me the methodology
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default MethodologyForm;
