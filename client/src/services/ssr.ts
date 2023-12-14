import axios from 'axios';
import { getServerSession } from 'next-auth/next';

import { options as authOptions } from 'pages/api/auth/[...nextauth]';

export const sessionSSR = async ({ req, res }) => await getServerSession(req, res, authOptions);

export const tasksSSR = async ({ req, res }) => {
  const session = await sessionSSR({ req, res });

  if (!session) {
    throw Error('Unauthorized');
  }

  return await axios({
    method: 'GET',
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`,
    params: { 'page[size]': 1, 'page[number]': 1, sort: '-createdAt' },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then(({ data: responseData }) => responseData.data);
};
