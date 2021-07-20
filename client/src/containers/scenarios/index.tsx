import { useState } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import { getScenarios } from 'services/scenarios';
import Component from './component';
import flatten from 'lodash/flatten';
// import concat from 'lodash/flatten';
import type { Scenario } from './types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
};

const ScenariosContainer: React.FC = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const query = useInfiniteQuery(['scenariosList', pageNumber], () => getScenarios({ pageNumber }), {
    retry: false,
    keepPreviousData: true,
    select: (data) => flatten(data.pages),

    // getNextPageParam: (data) => {
    //   if (data.length === 10) {
    //     setPageNumber(pageNumber+1)
    //     return pageNumber+1
    //   }
    // }
  });

  return <Component scenarios={query} />;
};

export default ScenariosContainer;
