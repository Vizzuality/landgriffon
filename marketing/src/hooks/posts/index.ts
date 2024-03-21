import axios from 'axios';
import { useQuery } from 'react-query';

type PostItem = {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
};

type PostsResponse = {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: PostItem[];
};

function usePosts() {
  const getPosts = async () => {
    const { data } = await axios.get<PostsResponse>(
      'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/vizzuality-blog/tagged/sustainable-supply-chain',
    );
    return data;
  };

  return useQuery('posts', getPosts);
}

export default usePosts;
