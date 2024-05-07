import { Config } from '@orval/core';

export default {
  landgriffon: {
    output: {
      mode: 'tags',
      client: 'react-query',
      target: './src/types/generated/api.ts',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/services/orval.ts',
          name: 'API',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
    input: {
      target: '../api/swagger-spec.json',
      filters: {
        tags: ['User'],
      },
    },
  },
} satisfies Config;
