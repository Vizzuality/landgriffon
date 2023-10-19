import { configureStore, combineReducers } from '@reduxjs/toolkit';
import router from 'next/router';
import { cloneDeep, isObject, mapValues, pickBy, omit } from 'lodash-es';

import { formatParam, routerReplace, routerReplaceMany } from './utils';

import ui from 'store/features/ui';
import analysisUI, {
  setSidebarCollapsed,
  initialState as analysisUIInitialState,
} from 'store/features/analysis/ui';
import analysisFilters, {
  initialState as analysisFiltersInitialState,
} from 'store/features/analysis/filters';
import analysisMap, { initialState as analysisMapInitialState } from 'store/features/analysis/map';
import analysisScenarios, {
  setCurrentScenario,
  initialState as analysisScenariosInitialState,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';

import type { Action, ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import type { AnalysisState } from './features/analysis';

const staticReducers = {
  ui,
  'analysis/ui': analysisUI,
  'analysis/filters': analysisFilters,
  'analysis/map': analysisMap,
  'analysis/scenarios': analysisScenarios,
};

const asyncReducers = {};

const createReducer = (reducers: ReducersMapObject) =>
  combineReducers({
    ...staticReducers,
    ...reducers,
  });

/**
 * Definition of which URL params will be sync with the store
 * Structure:
 * [name of the param in the URL]: { action }
 */
type QueryParam = {
  stateName: string;
  rootState: string;
  action: Action; // TO-DO: set the correct type
  defaultValue: unknown;
};

type QueryParams = Record<string, QueryParam>;

const QUERY_PARAMS_MAP: QueryParams = {
  collapsed: {
    stateName: 'isSidebarCollapsed',
    rootState: 'analysis/ui',
    action: setSidebarCollapsed,
    defaultValue: analysisUIInitialState.isSidebarCollapsed,
  },
  scenarioId: {
    stateName: 'currentScenario',
    rootState: 'analysis/scenarios',
    action: setCurrentScenario,
    defaultValue: analysisScenariosInitialState.currentScenario,
  },
  compareScenarioId: {
    stateName: 'scenarioToCompare',
    rootState: 'analysis/scenarios',
    action: setScenarioToCompare,
    defaultValue: analysisScenariosInitialState.scenarioToCompare,
  },
};

const FILTER_QUERY_PARAMS = [
  'indicator',
  'startYear',
  'materials',
  'origins',
  't1Suppliers',
  'producers',
  'locationTypes',
];

const getPreloadedState = (
  query: Record<string, string>,
  // It seems like is needed to specify the whole root object
  // because it doesn't merge with the original initial state
  _previousStateOriginal: AnalysisState = {
    'analysis/ui': { ...analysisUIInitialState },
    'analysis/map': { ...analysisMapInitialState },
    'analysis/scenarios': { ...analysisScenariosInitialState },
    'analysis/filters': { ...analysisFiltersInitialState },
  },
) => {
  const previousState = cloneDeep(_previousStateOriginal);
  Object.keys(QUERY_PARAMS_MAP).forEach((param) => {
    const { stateName, rootState } = QUERY_PARAMS_MAP[param];
    if (query[param]) {
      if (!previousState[rootState]) previousState[rootState] = {};
      previousState[rootState][stateName] = formatParam(query[param]);
    }
  });

  return previousState;
};

// Custom middleware to sync URL params and the store
const querySyncMiddleware: Middleware = () => (next) => (action) => {
  const { query, isReady } = router;
  if (!isReady) return next(action);

  // FILTERS
  if (action.type.includes('analysisFilters')) {
    if (action.type === 'analysisFilters/setFilter') {
      const { id, value } = action.payload;
      if (FILTER_QUERY_PARAMS.includes(id)) {
        const { [id]: currentQueryValue, ...restQueryParams } = query;
        const queryValue = isObject(value) ? (value as any).value : String(value);
        if (currentQueryValue !== value) {
          routerReplace({
            queryName: id,
            queryValue: queryValue,
            restQueries: restQueryParams,
          });
        }
      }
    }
    // ACTIONS THAT SET MULTIPLE FILTERS
    else if (
      action.type === 'analysisFilters/resetFilter' ||
      action.type === 'analysisFilters/setFilters'
    ) {
      const otherParams = omit(query, FILTER_QUERY_PARAMS);
      let filterParams = {};
      if (action.type === 'analysisFilters/setFilters') {
        const payloadQueries = pickBy(action.payload, (value, key) =>
          FILTER_QUERY_PARAMS.includes(key) && Array.isArray(value) ? value.length : !!value,
        );
        filterParams = mapValues(payloadQueries, (value) =>
          Array.isArray(value) ? value.map((v) => v.label) : value,
        );
      }
      routerReplaceMany(filterParams, otherParams);
    }
    return next(action);
  }

  if (action.type === 'analysisMap/setMapState') {
    const otherParams = omit(query, Object.keys(['latitude', 'longitude', 'zoom']));
    const { latitude, longitude, zoom } = action.payload;
    const newParams = pickBy({ latitude, longitude, zoom }, (value) => !!value);
    routerReplaceMany(newParams, otherParams);
  }

  // OTHER PARAMS
  Object.entries(QUERY_PARAMS_MAP).forEach(async ([param, queryState]) => {
    if (action.type === queryState.action.type) {
      const { [param]: currentQueryValue, ...queryWithoutParam } = query;

      const currentStateValue = action.payload;
      // Only update when URL the param value is different
      if (currentQueryValue !== currentStateValue) {
        await routerReplace({
          queryName: param,
          queryValue: currentStateValue,
          restQueries: queryWithoutParam,
        });
      }
    }
  });

  return next(action);
};

const createStore = (query = {}, currentState?: AnalysisState) =>
  configureStore({
    reducer: createReducer(asyncReducers),
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState: getPreloadedState(query, currentState),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(querySyncMiddleware),
  });

export type Store = ReturnType<typeof createStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<Store['getState']>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = Store['dispatch'];

export default createStore;
