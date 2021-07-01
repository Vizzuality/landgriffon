import type { NextApiRequest, NextApiResponse } from 'next';

const Hello = (req: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json({ name: 'John Doe' });
};

export default Hello;
