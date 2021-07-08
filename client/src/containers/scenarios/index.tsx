import { useEffect, useState } from 'react';
import Component from './component';
import type { Scenario, Scenarios } from './types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
};

/**
 * Scenarios mock data
 */
const DATA: Scenarios = [
  {
    title: 'Scenario name 1',
    description: null,
    id: 1,
    updatedAt: Date.now(),
    // user: { name: 'Francis' },
  },
  {
    title: 'Scenario name 2',
    description: null,
    id: 2,
    updatedAt: Date.now(),
    // user: { name: 'Elena' },
  },
  {
    title: 'Scenario name 3',
    description: null,
    id: 3,
    updatedAt: Date.now(),
    // user: { name: 'Pedro' },
  },
  {
    title: 'Scenario name 4',
    description: null,
    id: 4,
    updatedAt: Date.now(),
    // user: { name: 'Er Mendo' },
  },
];

type Response = {
  isLoading: boolean;
  data: Scenarios;
  error: unknown;
};

const fetch = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          isLoading: false,
          error: null,
          data: [ACTUAL_DATA, ...DATA], // Injecting Actual data
        } as Response),
      1000
    )
  );

const ScenariosContainer: React.FC = () => {
  // Simulating React-Query
  const [response, setResponse] = useState({
    isLoading: false,
    data: null,
    error: null,
  } as Response);

  useEffect(() => {
    const fetchScenarios = async () => {
      setResponse({
        ...response,
        isLoading: true,
      });
      const mock = await fetch();
      setResponse(mock as Response);
    };
    fetchScenarios();
  }, []);

  return <Component scenarios={response} />;
};

export default ScenariosContainer;
