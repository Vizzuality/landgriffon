import { useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'react-query';
import * as yup from 'yup';
import { nextAuthService } from 'services/authentication';
import AuthenticationLayout from 'layouts/authentication';
import { Label, Input, Checkbox } from 'components/forms';

type SignInPayload = {
  email: string;
  password: string;
};

const schemaValidation = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required('password is required'),
  remember: yup.boolean(),
});

const signInService = (data: SignInPayload) => nextAuthService.post('/signin/credentials', data);

const SignIn: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const mutation = useMutation(signInService, {
    onSuccess: () => {
      // Redirect to sign-in when user is created successfully
      router.push('/analysis');
    },
  });

  const handleSignIn = useCallback((data) => mutation.mutate(data), [mutation]);

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
                  {...register('email')}
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
                  <a href="#" className="font-medium text-green-800 hover:text-green-700">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign in
                </button>
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
