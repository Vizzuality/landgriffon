import React from 'react';

const Newsletter: React.FC = () => (
  <div className="mt-14 lg:mt-48">
    <h2 className="lg:text-2xl">
      Be the first to hear about new releases and updates.
    </h2>
    <form className="flex flex-col space-y-2">
      <div>
        <input type="email" placeholder="email address" className="bg-transparent border-0 border-b border-white" />
      </div>
      <div>
        <button type="submit" className="bg-black text-white rounded-xl px-5 py-1">Send</button>
      </div>
    </form>
  </div>
);

export default Newsletter;
