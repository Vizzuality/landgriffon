import { useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

import AuthenticationLayout from 'layouts/authentication';
import { authService } from 'services/authentication';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';

import type { ErrorResponse, ProfilePayload } from 'types';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'pages/_app';

const schemaValidation = yup.object({
  fname: yup.string().required('first name is required'),
  lname: yup.string().required('last name is required'),
  email: yup.string().email().required(),
  password: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password'), null], 'passwords must match'),
  roles: yup.array().of(yup.string()).optional().nullable(),
  id: yup.string().nullable().optional(),
});

const signUpService = (data: ProfilePayload) => authService.post('/sign-up', data);

const SignUp: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<yup.InferType<typeof schemaValidation>>({
    resolver: yupResolver(schemaValidation),
  });

  const signUp = useMutation(signUpService, {
    onSuccess: () => {
      toast.success('Account created successfully');
      // Redirect to sign-in when user is created successfully
      router.push('/auth/signin');
    },
    onError: (error: ErrorResponse) => {
      setIsLoading(false);
      if (error?.response) {
        const { data } = error.response;
        data?.errors.forEach(({ title }) => toast.error(title));
      }
    },
  });

  const handleSignUp = useCallback(
    (data: ProfilePayload) => {
      setIsLoading(true);
      signUp.mutate(data);
    },
    [signUp],
  );

  useEffect(() => {
    const handleStop = () => setIsLoading(false);

    // Prefetch the sign-in page
    router.prefetch('/auth/sign-in');
    router.events.on('routeChangeComplete', handleStop);

    return () => {
      router.events.off('routeChangeComplete', handleStop);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Sign up - Landgriffon</title>
      </Head>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <div className="mb-10 text-center">
            <h2 className="my-4 font-bold">Sign up</h2>
            <p className="text-sm font-medium text-gray-500">
              To create an account please enter your details below.
            </p>
          </div>
          <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit(handleSignUp)}>
            <div>
              <Label htmlFor="fname">First name</Label>
              <Input {...register('fname')} error={errors.fname?.message as string} />
            </div>
            <div>
              <Label htmlFor="lname">Last name</Label>
              <Input {...register('lname')} error={errors.lname?.message as string} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email address</Label>
              <Input {...register('email')} type="email" error={errors.email?.message as string} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                type="password"
                error={errors.password?.message as string}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="passwordConfirmation">Confirm password</Label>
              <Input
                {...register('passwordConfirmation')}
                type="password"
                error={errors.passwordConfirmation?.message as string}
              />
            </div>

            <div className="col-span-2 pt-8">
              <Button type="submit" className="w-full" loading={isLoading}>
                Sign up
              </Button>
            </div>
          </form>
        </div>
        <div className="my-4">
          <p className="text-sm text-center">
            <span className="text-white/50">Do you already have an account? </span>
            <Link href="/auth/signin">
              <a className="text-white">Sign-in</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

SignUp.Layout = function getLayout(page: ReactElement) {
  return <AuthenticationLayout>{page}</AuthenticationLayout>;
};

export default SignUp;
