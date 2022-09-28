import sendgridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY_CONTACT);
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY_SUBSCRIPTION);

const Methodology = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'POST') {
    const { name, email, information } = req.body;

    // Send a message to the user with Methodology link

    const msg = {
      to: email,
      from: 'no-reply@landgriffon.com',
      subject: `Landgriffon's Methodology`,
      text: `Hi ${name}, here you have our Methodology`,
      html: `
        <p><strong>Download our Methodology here</strong>: https://www.landgriffon.com/docs/LandGriffon_Methodology_Executive_Summary.pdf</p>`,
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

    // Save the user in a marketing list

    const data = {
      list_ids: information
        ? ['d2008d48-54fc-47ad-80d4-30fa831581ba', '1b704de4-643f-4531-b6cb-63fea0e6ad2a']
        : ['d2008d48-54fc-47ad-80d4-30fa831581ba'],
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
  } else {
    res.status(404).send(null);
  }
};

export default Methodology;
