import sendgridMail from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY_CONTACT);

const Contact = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'POST') {
    const { name, email, message, company, topic } = req.body;

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
