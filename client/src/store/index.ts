import { configureStore, combineReducers } from '@reduxjs/toolkit';
import router from 'next/router';
import { cloneDeep, isObject } from 'lodash-es';

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

const formatParam = (param: string): string | boolean | number => {
  if (['true', 'false'].includes(param)) return param === 'true';
  if (!Number.isNaN(Number(param))) return Number(param);
  if (checkValidJSON(param)) {
    const obj = JSON.parse(param);
    if (typeof obj === 'string') return param;
    return obj;
  }
  return param;
};

const checkValidJSON = (json: string) => {
  try {
    isObject(JSON.parse(json));
    return true;
  } catch (e) {
    return false;
  }
};

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

  Object.entries(QUERY_PARAMS_MAP).forEach(async ([param, queryState]) => {
    if (action.type === queryState.action.type) {
      const { [param]: currentQueryValue, ...queryWithoutParam } = query;
      const currentStateValue = action.payload;

      // Only update when URL the param value is different
      if (currentQueryValue !== currentStateValue) {
        await router.replace(
          {
            query: {
              ...queryWithoutParam,
              ...(!!currentStateValue
                ? {
                    [param]: ['string', 'number'].includes(typeof currentStateValue)
                      ? currentStateValue
                      : checkValidJSON(JSON.stringify(currentStateValue))
                        ? JSON.stringify(currentStateValue)
                        : currentStateValue,
                  }
                : {}),
            },
          },
          null,
          { shallow: true },
        );
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
