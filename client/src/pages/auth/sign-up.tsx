import { useCallback } from 'react';
import Head from 'next/head';
import AuthenticationLayout from 'layouts/authentication';
import LandgriffonLogo from 'containers/logo/component';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Home: React.FC = () => {
  const router = useRouter();

  const fakeLogin = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      router.push('/analysis');
    },
    [router],
  );

  return (
    <>
      <Head>
        <title>Sign Up - Landgriffon</title>
      </Head>
      <AuthenticationLayout>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <LandgriffonLogo />
              <h2 className="mt-4 mb-10 text-3xl font-bold">Sign Up</h2>
            </div>
            <form
              className="space-y-6"
              action="/analysis"
              method="POST"
              onSubmit={fakeLogin}
              id="signInForm"
            >
              <div>
                <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="fname"
                    name="fname"
                    type="fname"
                    autoComplete="fname"
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lname"
                    name="lname"
                    type="lname"
                    autoComplete="lname"
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-800 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign Up
                </button>
              </div>
            </form>

            <p className="mt-5">
              Already have an account?
              <Link href="./sign-in">
                <a className="text-green-900 hover:underline"> Log In</a>
              </Link>
            </p>
          </div>
        </div>
      </AuthenticationLayout>
    </>
  );
};

export default Home;
