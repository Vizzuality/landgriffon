import sendgridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY_CONTACT);
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY_SUBSCRIPTION);

const DOWNLOAD_LINKS = {
  fullMethodology: 'https://www.landgriffon.com/docs/LG_Methodology_Technical_Note.pdf',
  executiveSummary: 'https://www.landgriffon.com/docs/LG_Methodology_Executive_Summary.pdf',
};

const Methodology = (req: NextApiRequest, res: NextApiResponse): void => {
  if (req.method === 'POST') {
    const { name, email, newsletter } = req.body;
    // Send a message to the user with Methodology link

    const msg = {
      to: email,
      from: {
        email: 'hello@landgriffon.com',
        name: 'LandGriffon',
      },
      subject: `Landgriffon's Methodology`,
      text: `Hi ${name}\n\n
      Thank you for your interest in LandGriffon's Methodology!\n\n
      LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. Similar to our philosophy around open-source, we are keeping our science open and transparent as well.\n\n
      Our methodology is a work in progress and will continue to evolve. We will contact you when we release any updates.\n\n
      You can access them again here:\n\n
      ${DOWNLOAD_LINKS.fullMethodology}\n\n
      ${DOWNLOAD_LINKS.executiveSummary}\n\n
      We want LandGriffon to serve you and create real change in the sector. If you have anything you would like to share with us regarding the methodology, please let us know. We welcome feedback and input.\n\n
      All the best,\n\n
      The LandGriffon team\n\n
      `,
      html: `
        <p>Hi ${name}</p>
        <br/>
        <p>Thank you for your interest in LandGriffon's Methodology!</p>
        <p>LandGriffon helps companies strategize the <strong>sustainable transformation</strong> of their <strong>supply</strong> chains by using technology, data and scientific-based analysis to manage environmental impacts. Similar to our philosophy around <strong>open-source</strong>, we are keeping <strong>our science open and transparent</strong> as well.</p>
        <p>Our methodology is a work in progress and will continue to evolve. We will contact you when we release any updates.</p>
        <p>To access them again, here is the:<ul><li><a href="${DOWNLOAD_LINKS.fullMethodology}">Full Methodology Document</a></li><li><a href="${DOWNLOAD_LINKS.executiveSummary}">Executive Summary Document</a></li></ul></p>
        <p>We want LandGriffon to serve you and create real change in the sector. <strong>If you have anything you would like to share with us regarding the methodology, please let us know</strong>. We welcome feedback and input.</p>
        <br/>
        <br/>
        <p>All the best,</p>
        <p>The LandGriffon team</p>
      `,
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
      list_ids: newsletter
        ? ['1b704de4-643f-4531-b6cb-63fea0e6ad2a', 'd2008d48-54fc-47ad-80d4-30fa831581ba'] // contact + methodology
        : ['d2008d48-54fc-47ad-80d4-30fa831581ba'], // methodology
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
