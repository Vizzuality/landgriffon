import sendgridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY_CONTACT);
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY_SUBSCRIPTION);

const Contact = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'POST') {
    const { name, email, message, company, topic, newsletter } = req.body;

    // Saving contacts and emails in Sendgrid
    const list_ids = newsletter
      ? ['0ee4b8ab-2088-44c1-b7cc-5eab97a49fda', '1b704de4-643f-4531-b6cb-63fea0e6ad2a'] // contact + newsletter
      : ['0ee4b8ab-2088-44c1-b7cc-5eab97a49fda']; // contact

    const data = {
      list_ids,
      contacts: [
        {
          email,
        },
      ],
    };

    const request = {
      url: `/v3/marketing/contacts`,
      method: 'PUT' as const,
      body: data,
    };

    sendgridClient.request(request).then(
      () => {
        res.status(200).json({ status: 'success' });
      },
      (error) => {
        if (error.response) {
          res.status(400).json(error.response.body);
        }
      },
    );

    // Sending email to the user
    const msg = {
      to: 'hello@landgriffon.com',
      from: 'no-reply@landgriffon.com',
      subject: `Contact: ${topic}`,
      text: `A new message has been received from the Marketing site.\n\n
      Name: ${name}\n\n
      Company: ${company}\n\n
      Message: ${message}`,
      html: `<p>A new message has been received from the Marketing site.</p>
        <p><strong>Name</strong>: ${name}</p>
        <p><strong>Email</strong>: ${email}</p>
        <p><strong>Company</strong>: ${company}</p>
        <p><strong>Message</strong>: ${message}</p>`,
    };

    sendgridMail.send(msg).then(
      () => {
        res.status(200).json({ status: 'success ' });
      },
      (error) => {
        if (error.response) {
          res.status(400).json(error.response.body);
        }
      },
    );
  } else {
    res.status(404).send(null);
  }
};

export default Contact;
