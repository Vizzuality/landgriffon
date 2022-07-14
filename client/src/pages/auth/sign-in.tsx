import { useCallback, useState } from 'react';
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

const schemaValidation = yup.object({
  username: yup.string().email().required(),
  password: yup.string().min(8).required('password is required'),
  remember: yup.boolean(),
});

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const handleSignIn = useCallback(
    (data) => {
      setIsLoading(true);
      signIn('credentials', {
        ...data,
        redirect: false,
      }).then(({ error }) => {
        if (error) {
          setIsLoading(false);
          toast.error('Login failed. Your emails or password is incorrect.');
        } else {
          router.push('/analysis');
        }
      });
    },
    [router],
  );

  return (
    <>
      <Head>
        <title>Sign in - Landgriffon</title>
      </Head>
      <AuthenticationLayout>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold my-4">Sign in to your account</h2>
              <p className="text-sm font-medium text-gray-500">
                To continue please enter your details below.
              </p>
            </div>
            <form className="space-y-6" id="signInForm" onSubmit={handleSubmit(handleSignIn)}>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  {...register('username')}
                  type="email"
                  id="email"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register('password')}
                  type="password"
                  id="password"
                  error={errors.password?.message}
                />
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  {...register('remember')}
                  id="rememberMe"
                  error={errors.remember?.message}
                >
                  Remember me
                </Checkbox>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-green-700">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button type="submit" theme="primary" className="w-full" loading={isLoading}>
                  Sign in
                </Button>
              </div>
            </form>
          </div>
          <div className="my-4">
            <p className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up">
                <a className="text-white">Sign-up</a>
              </Link>
            </p>
          </div>
        </div>
      </AuthenticationLayout>
    </>
  );
};

export default SignIn;
