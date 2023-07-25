import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import AuthenticationLayout from 'layouts/authentication';
import { Label, Input, Checkbox } from 'components/forms';
import { Button } from 'components/button';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';

const schemaValidation = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required('password is required'),
  remember: yup.boolean(),
});

const SignIn: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
    shouldUseNativeValidation: false,
  });

  const handleSignIn = useCallback(
    async (data) => {
      setIsLoading(true);
      const { ok } = await signIn('credentials', {
        ...data,
        username: data.email,
        redirect: false,
      });

      if (ok) {
        router.push((router.query?.callbackUrl as string) || '/analysis/map', undefined, {
          shallow: true,
        });
      } else {
        setIsLoading(false);
        toast.error('Login failed. Your email or password is incorrect.');
      }
    },
    [router],
  );

  useEffect(() => {
    const handleStop = () => setIsLoading(false);

    // Prefetch the analysis page
    router.prefetch('/analysis');
    router.events.on('routeChangeComplete', handleStop);

    return () => {
      router.events.off('routeChangeComplete', handleStop);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Sign in - Landgriffon</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <div className="mb-10 text-center">
            <h2 className="my-4 font-bold">Sign in to your account</h2>
            <p className="text-sm font-medium text-gray-500">
              To continue please enter your details below.
            </p>
          </div>
          <form
            noValidate
            className="space-y-6"
            id="signInForm"
            onSubmit={handleSubmit(handleSignIn)}
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                {...register('email')}
                type="email"
                id="email"
                error={errors.email?.message as string}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                type="password"
                id="password"
                error={errors.password?.message as string}
              />
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                {...register('remember')}
                id="rememberMe"
                error={errors.remember?.message as string}
              >
                Remember me
              </Checkbox>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-navy-400 hover:text-navy-800"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="pt-8">
              <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                Sign in
              </Button>
            </div>
          </form>
        </div>
        {/* <div className="my-4">
          <p className="text-sm text-center">
            <span className="text-white/50">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-white">
              Sign-up
            </Link>
          </p>
        </div> */}
      </div>
    </>
  );
};

SignIn.Layout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignIn;
