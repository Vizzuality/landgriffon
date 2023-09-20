import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useCallback, type ReactElement, useState } from 'react';

import AuthenticationLayout from 'layouts/authentication';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';
import { useResetPassword } from 'hooks/profile';

import type { NextPageWithLayout } from 'pages/_app';

const schemaValidation = yup.object({
  password: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password'), null], 'passwords must match'),
});

const ResetPassword: NextPageWithLayout = () => {
  const { replace, query } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
    shouldUseNativeValidation: false,
  });

  const { mutate: resetPassword, isLoading } = useResetPassword();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleResetPassword = useCallback(
    ({ password }: yup.InferType<typeof schemaValidation>) => {
      const token = query?.token as string;
      if (!token) {
        toast.error('Invalid token');
        return;
      }
      resetPassword(
        { password, token },
        {
          onSuccess: async ({ email }) => {
            // Automatically sign in after reset password
            const { ok, error } = await signIn('credentials', {
              email: email,
              username: email,
              password,
              redirect: false,
            });
            // Redirect to the callback url if it exists or to the analysis page
            if (ok) {
              setIsRedirecting(true);
              replace((query?.callbackUrl as string) || '/analysis/map', undefined, {
                shallow: true,
              });
            }
            if (error) {
              toast.error(error);
            }
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    },
    [replace, query?.callbackUrl, query?.token, resetPassword],
  );

  return (
    <>
      <Head>
        <title>Reset password - Landgriffon</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <div className="mb-10 text-center">
            <h2 className="my-4 font-bold">Reset your password</h2>
          </div>
          <form
            noValidate
            className="space-y-6"
            id="signInForm"
            onSubmit={handleSubmit(handleResetPassword)}
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
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading || isRedirecting}
              >
                Reset password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

ResetPassword.Layout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default ResetPassword;
