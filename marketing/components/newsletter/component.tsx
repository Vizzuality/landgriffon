import React, { useState } from 'react';
import axios from 'axios';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXTGcggnHX5xGVwTmENijyIUEMyYcQdDrMeBAZ_S9OsjIrxqYBuPFEKrRifkra3jER1g/exec';

const DEFAULT_STATUS = {
  error: null,
  fetching: false,
  success: false,
};

const Newsletter: React.FC = () => {
  const [status, setStatus] = useState(DEFAULT_STATUS);

  const handleSubmit = (event) => {
    setStatus({ ...DEFAULT_STATUS, fetching: true });
    const data = new FormData(event.target);
    axios.post(SCRIPT_URL, { data })
      .then(() => setStatus({ ...DEFAULT_STATUS, success: true }))
      .catch((error) => setStatus({ ...DEFAULT_STATUS, error: error.message }));
    event.preventDefault();
  };

  let buttonText = 'Send';
  if (status.fetching) buttonText = '...';
  if (status.success) buttonText = 'Sent!';
  if (status.error) buttonText = 'Send again';

  return (
    <div className="mt-14 lg:mt-48">
      <h2 className="lg:text-2xl">
        Be the first to hear about new releases and updates.
      </h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <div>
          <input
            className="bg-transparent placeholder-white px-0 py-2 text-2xl w-full
              border-0 border-b border-white border-opacity-50
              focus:border-0 focus:border-opacity-100 focus:outline-none focus:border-white focus:border-b focus:shadow-none"
            name="subscriber"
            placeholder="email address"
            required
            style={{ boxShadow: 'none' }} // override
            type="email"
          />
        </div>
        <div>
          <button type="submit" className="bg-black text-white rounded-xl px-5 py-1 hover:bg-gray-900">
            {buttonText}
          </button>
        </div>
        {status.error && (
          <div className="flex space-x-2">
            <img src="/error-icon.svg" alt="Error icon" />
            <span>{status.error}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Newsletter;
