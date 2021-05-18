import { configureStore } from '@reduxjs/toolkit';

// Add your reducers here
const reducer = {};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
