import { createQueryKeyStore, inferQueryKeyStore } from '@lukemorales/query-key-factory';

import { Layer, CommonH3APIParams } from '@/types';

const queryKeyStore = createQueryKeyStore({
  contextualLayers: {
    categories: {
      queryKey: null,
    },
  },
  h3data: {
    layer: (id: Layer['id'], params?: CommonH3APIParams) => ({
      queryKey: [id, params],
    }),
  },
});

export type QueryKeys = inferQueryKeyStore<typeof queryKeyStore>;

export default queryKeyStore;
