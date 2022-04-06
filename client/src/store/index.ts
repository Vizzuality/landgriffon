import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { ReducersMapObject } from '@reduxjs/toolkit';
import ui from 'store/features/ui';
import analysisUI from 'store/features/analysis/ui';
import analysisFilters from 'store/features/analysis/filters';
import analysisMap from 'store/features/analysis/map';
import analysisScenarios from 'store/features/analysis/scenarios';

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

const store = configureStore({
  reducer: createReducer(asyncReducers),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
