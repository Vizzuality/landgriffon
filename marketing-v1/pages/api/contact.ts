import sendgridMail from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY_CONTACT);

const Contact = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'POST') {
    const msg = {
      to: 'hello@landgriffon.com',
      from: 'no-reply@landgriffon.com',
      subject: `Contact: ${req.body.subject}`,
      text: `A new message has been received from the Marketing site.\n\n
      Name: ${req.body.name}\n\n
      Company: ${req.body.company}\n\n
      Message: ${req.body.message}`,
      html: `<p>A new message has been received from the Marketing site.</p>
        <p><strong>Name</strong>: ${req.body.name}</p>
        <p><strong>Email</strong>: ${req.body.email}</p>
        <p><strong>Company</strong>: ${req.body.company}</p>
        <p><strong>Message</strong>: ${req.body.message}</p>`,
    };

    sendgridMail.send(msg).then(
      () => {
        res.status(200).json({ status: 'success ' });
      },
      (error) => {
        if (error.response) {
          res.status(400).json(error.response.body);
        }
      }
    );
  } else {
    res.status(404).send(null);
  }
};

export default Contact;
