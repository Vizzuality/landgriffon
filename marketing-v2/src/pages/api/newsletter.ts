import sendgridClient from '@sendgrid/client';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridClient.setApiKey(process.env.SENDGRID_API_KEY_SUBSCRIPTION);

const Newsletter = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'PUT') {
    const { email } = req.body;

    const data = {
      list_ids: ['1b704de4-643f-4531-b6cb-63fea0e6ad2a'],
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

export default Newsletter;
