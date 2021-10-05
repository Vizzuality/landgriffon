import React from 'react';

import Wrapper from 'containers/wrapper';

import Button from 'components/button';


export const ContactForm = () => (
  <section className="relative flex flex-col pt-24 font-sans">
    <Wrapper>

      <h3 className="text-7xl">Contact Us</h3>



      <div className="flex pt-20 pb-48">
        <div className="flex flex-col w-3/5 space-y-10">
          <div className='flex w-full space-x-5'>
            <label
              className="w-1/2 text-xs uppercase text-lightGray font-sans-semibold"
              htmlFor="name"
            >
              Name
              <input
                id="name"
                name="name"
                type="input"
                placeholder="John"
                className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
              />
            </label>
            <label
              className="w-1/2 text-xs uppercase text-lightGray font-sans-semibold"
              htmlFor="company"
            >
              Company
              <input
                id="company"
                name="company"
                type="input"
                placeholder="Super company"
                className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
              />
            </label>
          </div>

          <label
            className="w-1/2 pr-3 text-xs uppercase text-lightGray font-sans-semibold"
            htmlFor="email"
          >
            Email
            <input
              id="email"
              name="email"
              type="input"
              placeholder="email@email.com"
              className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
            />
          </label>

          <label
            className="w-1/2 pr-3 text-xs uppercase text-lightGray font-sans-semibold"
            htmlFor="subject"
          >
            Subject
            <input
              id="subject"
              name="subject"
              type="input"
              placeholder="Message subject"
              className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
            />
          </label>

          <label
            className="w-1/2 pr-3 text-xs uppercase text-lightGray font-sans-semibold"
            htmlFor="message"
          >
            Message
            <input
              id="message"
              name="message"
              type="input"
              placeholder="My message"
              className="w-full h-10 mr-3 font-sans text-lg text-black placeholder-black bg-transparent border-b cursor-pointer border-darkGray border-px"
            />
          </label>

          <div className="flex items-center pt-2">
            <input
              id="agree"
              name="agree"
              type="radio"
              className="mr-3 text-black bg-transparent cursor-pointer w-7 h-7 border-darkGray border-px"
            />
            <p>
              I agree with the Landgriffon’s {" "}
              <a
                className="underline cursor-pointer"
                href="https://landgriffon.com/privacy-policy"
              >
                Privacy statement.
              </a>
            </p>

            <Button
              theme="secondary"
              size="s"
              className="box-border flex-shrink-0 h-10 ml-5 w-28"
              onClick={() => console.info("Send")}
            >
              Send
            </Button>
          </div>
        </div>
        <div className="absolute right-0 flex flex-col w-2/5 px-12 space-y-12 text-xl flex-end bg-bege py-28">
          <div className="flex flex-col space-y-2">
            <p className="font-sans-semibold">Email us</p>
            <p>hello@vizzuality.com</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-sans-semibold">Our location</p>
            <p>Madrid,
              <br />
              Spain
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  </section >
);

export default ContactForm;
