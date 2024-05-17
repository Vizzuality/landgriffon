import React, { useState } from 'react';

import Methodology from './methodology';
import Webinar from './webinar';
import DatasetReleases from './releases';
import Podcast from './podcast';

const FILTERS = ['all', 'methodology', 'dataset-releases', 'webinar-and-podcasts', 'blogs'];
const FILTERS_DICTIONARY = {
  all: 'All',
  methodology: 'Methodology',
  'dataset-releases': 'Dataset releases',
  'webinar-and-podcasts': 'Webinar & Podcast',
  blogs: 'Blogs',
};

const Resources: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  return (
    <div className="bg-white space-y-14">
      <div className="flex justify-center front-light items-center space-x-8">
        <span>Filter by:</span>
        <div className="flex space-x-2.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${
                filter === f ? 'bg-green-500 text-white' : 'bg-gray-100 text-black'
              } px-2.5 py-[5px]`}
            >
              {FILTERS_DICTIONARY[f]}
            </button>
          ))}
        </div>
      </div>
      {(filter === 'all' || filter === 'methodology') && <Methodology />}
      {(filter === 'all' || filter === 'dataset-releases') && <DatasetReleases />}
      {(filter === 'all' || filter === 'webinar-and-podcasts') && <Webinar />}
      {(filter === 'all' || filter === 'blogs') && <Podcast />}
    </div>
  );
};

export default Resources;
