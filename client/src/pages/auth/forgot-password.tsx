import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import AuthenticationLayout from 'layouts/authentication';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { useSendResetPasswordEmail } from 'hooks/profile';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';

const schemaValidation = yup.object({
  email: yup.string().email().required(),
});

const SignIn: NextPageWithLayout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
    shouldUseNativeValidation: false,
  });

  const email = watch('email');

  const {
    isLoading,
    isSuccess,
    mutate: sendResetPasswordEmail,
    reset,
  } = useSendResetPasswordEmail();

  const handleSend = (data: yup.InferType<typeof schemaValidation>) => {
    sendResetPasswordEmail(
      { email: data.email },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Landgriffon</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 text-center min-h-[362px] flex justify-between flex-col py-8 bg-white shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <>
              <div className="text-start mb-20">
                <div className="bg-blue-400 h-[34px] w-[62px]">
                  <div className="w-0 h-0 border-t-blue-200 border-t-[26px] border-r-[31px] border-r-transparent border-l-[31px] border-l-transparent"></div>
                </div>
                <h2 className="my-6 font-bold text-xl text-gray-900">Check your email</h2>
                <p className="text-sm font-medium text-gray-600">
                  We&apos;ve sent a email to:
                  <span className="text-gray-300 block">{email}</span>
                </p>
              </div>

              <div className="text-start mt-2">
                <p className="text-sm font-medium text-gray-600">
                  Didn&apos;t recieve an email? Check your spam folder!
                </p>
                <Button
                  onClick={reset}
                  variant="transparent"
                  className="font-medium text-navy-400 hover:text-navy-900 pl-0 pr-0"
                  loading={isLoading}
                >
                  Click to resend
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <h2 className="my-4 font-bold">Forgot Password?</h2>
                <p className="text-sm font-sm text-gray-400">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form
                noValidate
                className="space-y-6 text-left mt-6"
                id="signInForm"
                onSubmit={handleSubmit(handleSend)}
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    type="email"
                    id="email"
                    error={errors.email?.message as string}
                  />
                </div>

                <div className="pt-8">
                  <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                    Send email
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

SignIn.Layout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
