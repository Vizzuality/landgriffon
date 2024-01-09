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
          toast.error(error.response?.data?.errors?.[0].title || error.message);
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
        <div className="flex min-h-[362px] flex-col justify-between bg-white px-4 py-8 text-center shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <>
              <div className="mb-20 text-start">
                <div className="h-[34px] w-[62px] bg-blue-400">
                  <div className="h-0 w-0 border-l-[31px] border-r-[31px] border-t-[26px] border-l-transparent border-r-transparent border-t-blue-200"></div>
                </div>
                <h2 className="my-6 text-xl font-bold text-gray-900">Check your email</h2>
                <p className="text-sm font-medium text-gray-600">
                  We&apos;ve sent a email to:
                  <span className="block text-gray-300">{email}</span>
                </p>
              </div>

              <div className="mt-2 text-start">
                <p className="text-sm font-medium text-gray-600">
                  Didn&apos;t recieve an email? Check your spam folder!
                </p>
                <Button
                  onClick={reset}
                  variant="transparent"
                  className="pl-0 pr-0 font-medium text-navy-400 hover:text-navy-900"
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
                <p className="font-sm text-sm text-gray-400">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form
                noValidate
                className="mt-6 space-y-6 text-left"
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
