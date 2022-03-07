import { useCallback, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AuthenticationLayout from 'layouts/authentication';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'react-query';
import * as yup from 'yup';
import { authService } from 'services/authentication';
import { Label, Input } from 'components/forms';
import { Button } from 'components/button';

type SignUpPayload = {
  fname: string;
  lname: string;
  email: string;
  password: string;
};

const schemaValidation = yup.object({
  fname: yup.string().required('first name is required'),
  lname: yup.string().required('last name is required'),
  email: yup.string().email().required(),
  password: yup.string().min(8).required('password is required'),
  passwordConfirmation: yup
    .string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password'), null], 'passwords must match'),
});

const signUpService = (data: SignUpPayload) => authService.post('/sign-up', data);

const SignUp: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const mutation = useMutation(signUpService, {
    onSuccess: () => {
      setIsLoading(false);
      // Redirect to sign-in when user is created successfully
      router.push('/auth/sign-in');
    },
  });

  const handleSignUp = useCallback(
    (data: SignUpPayload) => {
      setIsLoading(true);
      mutation.mutate(data);
    },
    [mutation],
  );

  return (
    <>
      <Head>
        <title>Sign up - Landgriffon</title>
      </Head>
      <AuthenticationLayout>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold my-4">Sign up</h2>
              <p className="text-sm font-medium text-gray-500">
                To create an account please enter your details below.
              </p>
            </div>
            <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit(handleSignUp)}>
              <div>
                <Label htmlFor="fname">First name</Label>
                <Input {...register('fname')} error={errors.fname?.message} />
              </div>
              <div>
                <Label htmlFor="lname">Last name</Label>
                <Input {...register('lname')} error={errors.lname?.message} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email address</Label>
                <Input {...register('email')} type="email" error={errors.email?.message} />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input {...register('password')} type="password" error={errors.password?.message} />
              </div>

              <div className="col-span-2">
                <Label htmlFor="passwordConfirmation">Confirm password</Label>
                <Input
                  {...register('passwordConfirmation')}
                  type="password"
                  error={errors.passwordConfirmation?.message}
                />
              </div>

              <div className="col-span-2">
                <Button type="submit" className="w-full" loading={isLoading}>
                  Sign up
                </Button>
              </div>
            </form>
          </div>
          <div className="my-4">
            <p className="text-center text-sm">
              Do you already have an account?{' '}
              <Link href="/auth/sign-in">
                <a className="text-white">Sign-in</a>
              </Link>
            </p>
          </div>
        </div>
      </AuthenticationLayout>
    </>
  );
};

export default SignUp;
