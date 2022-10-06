import cx from 'classnames';
import axios from 'axios';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';

import Wrapper from 'containers/wrapper';
import { useCallback, useState } from 'react';
import { useSaveContactMethodologySendgrid } from 'hooks/methodology';
import Loading from 'components/loading';

const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  company: yup.string().required(),
  terms: yup.bool().oneOf([true]).required(),
  information: yup.bool(),
});

interface MethodologyFormProps {
  close: () => void;
}

const SCRIPT_URL =
  'https://docs.google.com/forms/u/0/d/e/1FAIpQLScDKrOAmTYsarPJOt1dw7V7HXg-VJvZYjtfCmCwBPcquGXSSA/formResponse';

const MethodologyForm: React.FC<MethodologyFormProps> = ({ close }) => {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const saveContactMethodologyMutation = useSaveContactMethodologySendgrid({});

  const saveContactMethodologyDocs = useCallback((data) => {
    const docData = new FormData();
    docData.append('entry.1389554217', data.email);
    docData.append('entry.1442491647', data.name);
    docData.append('entry.1779120400', data.company);
    docData.append('entry.204130736', 'methodology');

    // TO-DO: solve CORS issue with google forms
    axios
      .post(SCRIPT_URL, docData)
      .then((response) => console.log(response))
      .catch((error) => console.error(error))
      .then(() => setSubmitting(false));
  }, []);

  const onSubmit = useCallback(
    (data) => {
      setSubmitting(true);
      saveContactMethodologyDocs(data);
      saveContactMethodologyMutation.mutate(
        { data },
        {
          onSuccess: () => {
            setSubmitting(false);
            close();
          },
          onError: () => {
            setSubmitting(false);
          },
        },
      );
    },
    [close, saveContactMethodologyDocs, saveContactMethodologyMutation],
  );

  return (
    <section className="overflow-hidden bg-white">
      <Wrapper>
        <div className="relative z-10 py-12 md:py-20 xl:-mt-10 xl:px-20 xl:-mx-20">
          {submitting && (
            <div className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full bg-blue-500/50">
              <Loading />
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="flex flex-col space-y-5 md:flex-row md:items-end md:justify-between md:space-y-0 md:space-x-10">
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

                <div>
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
                      I agree with LandGriffon’s{' '}
                      <Link href="/privacy-policy">
                        <a className="font-semibold text-black underline">Privacy Policy.</a>
                      </Link>
                    </label>
                  </div>

                  <div className="flex items-center mt-5 space-x-2.5">
                    <input
                      id="information"
                      type="checkbox"
                      {...register('information')}
                      className={cx({
                        'border-red-500': errors.terms,
                      })}
                    />
                    <label className="font-light" htmlFor="information">
                      I want to be added to the LandGriffon mailing list for occasional updates
                      through the email newsletter.
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="py-4 font-semibold text-black bg-transparent border border-black px-14 hover:bg-black/10"
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default MethodologyForm;
