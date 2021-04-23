import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Form, Field } from 'react-final-form';

const SCRIPT_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScDKrOAmTYsarPJOt1dw7V7HXg-VJvZYjtfCmCwBPcquGXSSA/formResponse';

const DEFAULT_STATUS = {
  error: null,
  fetching: false,
  success: false,
};

const Newsletter: React.FC = () => {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const { basePath } = useRouter();

  const onSubmit = (values) => {
    const data = new FormData();
    data.append('entry.1389554217', values.subscriber);
    axios({
      method: 'post',
      url: SCRIPT_URL,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => setStatus({ ...DEFAULT_STATUS, success: true }))
      .catch((error) => setStatus({ ...DEFAULT_STATUS, error: error.message }));
  };

  let buttonText = 'Send';
  if (status.fetching) buttonText = '...';
  if (status.success) buttonText = 'Sent!';
  if (status.error) buttonText = 'Send again';

  return (
    <div className="mt-14 lg:mt-48">
      <h2 className="text-base lg:text-lg font-light mb-4 lg:mb-12">
        Be the first to hear about new releases and updates.
      </h2>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form className="flex flex-col space-y-4 lg:space-y-5" onSubmit={handleSubmit}>
            <div>
              <Field
                className="bg-transparent placeholder-white px-0 py-2 text-base lg:text-lg w-full font-light
                  border-0 border-b border-white border-opacity-50
                  focus:border-0 focus:border-opacity-100 focus:outline-none focus:border-white focus:border-b focus:shadow-none"
                component="input"
                name="subscriber"
                placeholder="email address"
                required
                style={{ boxShadow: 'none' }} // override
                type="email"
              />
            </div>
            <div>
              <label htmlFor="termsAcceptance" className="flex items-center font-light text-base lg:text-lg">
                <input
                  className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                  id="termsAcceptance"
                  required
                  type="checkbox"
                />
                <span>
                  Check here to indicate that you read and agree to the
                  &nbsp;
                  <Link href="/privacy-policy">
                    <a className="font-bold underline">terms</a>
                  </Link>
                </span>
              </label>
            </div>
            <div>
              <button type="submit" className="bg-black font-bold text-white text-base rounded-full px-6 py-3 hover:bg-gray-900">
                {buttonText}
              </button>
            </div>
            {status.error && (
              <div className="flex space-x-2">
                <img src={`${basePath}/error-icon.svg`} alt="Error icon" width="20" height="20" />
                <span>{status.error}</span>
              </div>
            )}
          </form>
        )}
      />
    </div>
  );
};

export default Newsletter;
