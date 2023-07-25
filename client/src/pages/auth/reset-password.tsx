import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import AuthenticationLayout from 'layouts/authentication';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { useResetPassword } from 'hooks/profile';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';

const schemaValidation = yup.object({
  password: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password'), null], 'passwords must match'),
});

const SignIn: NextPageWithLayout = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
    shouldUseNativeValidation: false,
  });

  const { mutate: resetPassword, isLoading } = useResetPassword();

  const handleResetPassord = (data: yup.InferType<typeof schemaValidation>) => {
    resetPassword(data.password, {
      onSuccess: async (result) => {
        const { ok } = await signIn('credentials', {
          email: result.email,
          username: result.email,
          password: data.password,
          redirect: false,
        });
        if (ok) {
          router.push((router.query?.callbackUrl as string) || '/analysis/map', undefined, {
            shallow: true,
          });
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <>
      <Head>
        <title>Sign in - Landgriffon</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <div className="mb-10 text-center">
            <h2 className="my-4 font-bold">Reset your password</h2>
            {/* <p className="text-sm font-medium text-gray-500">
              To continue please enter your details below.
            </p> */}
          </div>
          <form
            noValidate
            className="space-y-6"
            id="signInForm"
            onSubmit={handleSubmit(handleResetPassord)}
          >
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                {...register('password')}
                type="password"
                id="password"
                error={errors.password?.message as string}
              />
            </div>
            <div>
              <Label htmlFor="passwordConfirmation">Confirm new password</Label>
              <Input
                {...register('passwordConfirmation')}
                type="password"
                error={errors.passwordConfirmation?.message}
                data-testid="confirm-password-input"
              />
            </div>
            <div className="pt-8">
              <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

SignIn.Layout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
