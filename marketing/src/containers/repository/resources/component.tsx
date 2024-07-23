import React, { useState } from 'react';

import Methodology from './methodology';
import Webinar from './webinar';
import DatasetReleases from './releases';
import Podcast from './podcast';
import Wrapper from 'containers/wrapper/component';

type FilterType = 'all' | 'methodology' | 'dataset-releases' | 'webinar-and-podcasts'; // | 'blogs'

const FILTERS: FilterType[] = [
  'all',
  'methodology',
  'dataset-releases',
  'webinar-and-podcasts',
  // 'blogs',
];

const FILTERS_DICTIONARY: Record<FilterType, string> = {
  all: 'All',
  methodology: 'Methodology',
  'dataset-releases': 'Dataset releases',
  'webinar-and-podcasts': 'Webinar & Podcast',
  // blogs: 'Blogs',
};

const Resources: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  return (
    <div className="bg-white space-y-14 px-5">
      <Wrapper>
        <div className="m-auto w-full md:flex-row flex front-light md:space-x-8 flex-col justify-start items-center">
          <span className="whitespace-nowrap flex justify-start w-full md:w-fit">Filter by:</span>
          <div className="w-full flex md:space-x-2.5 justify-start flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${filter === f ? 'bg-green-500 text-white' : 'bg-gray-100 text-black'
                  } px-2.5 py-[5px]`}
              >
                {FILTERS_DICTIONARY[f]}
              </button>
            ))}
          </div>
        </div>
      </Wrapper>
      {(filter === 'all' || filter === 'methodology') && <Methodology />}
      {(filter === 'all' || filter === 'dataset-releases') && <DatasetReleases />}
      {(filter === 'all' || filter === 'webinar-and-podcasts') && (
        <>
          <Webinar />
          <Podcast />
        </>
      )}
      {/* {(filter === 'all' || filter === 'blogs') && <></>} */}
    </div>
  );
};

export default Resources;
