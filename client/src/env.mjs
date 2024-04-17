import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },

  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    // ? URL (including protocol) of the client application
    NEXTAUTH_URL: z
      .string()
      .url()
      .default(`http://localhost:${process.env.PORT || 3000}`),
    // ? Secret used for cryptographic operations in the client application. Generate using `openssl rand -base64 32`
    NEXTAUTH_SECRET: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    // ? URL (including protocol) of the API
    NEXT_PUBLIC_API_URL: z.string().url(),
    // ? enables access to EUDR page
    NEXT_PUBLIC_ENABLE_EUDR: z.coerce.boolean().optional().default(false),
    NEXT_PUBLIC_PLANET_API_KEY: z.string().default('PLAK6679039df83f414faf798ba4ad4530db'),
    NEXT_PUBLIC_CARTO_FOREST_ACCESS_TOKEN: z
      .string()
      .default(
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjY2JlMjUyYSJ9.LoqzuDp076ESVYmHm1mZNtfhnqOVGmSxzp60Fht8PQw',
      ),
    NEXT_PUBLIC_CARTO_DEFORESTATION_ACCESS_TOKEN: z
      .string()
      .default(
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiJjZDk0ZWIyZSJ9.oqLagnOEc-j7Z4hY-MTP1yoZA_vJ7WYYAkOz_NUmCJo',
      ),
    NEXT_PUBLIC_CARTO_RADD_ACCESS_TOKEN: z
      .string()
      .default(
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemsydWhpaDYiLCJqdGkiOiI3NTFkNzA1YSJ9.jrVugV7HYfhmjxj-p2Iks8nL_AjHR91Q37JVP2fNmtc',
      ),
    NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE: z.coerce.number().default(10000000),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_EUDR: process.env.NEXT_PUBLIC_ENABLE_EUDR,
    NEXT_PUBLIC_PLANET_API_KEY: process.env.NEXT_PUBLIC_PLANET_API_KEY,
    NEXT_PUBLIC_CARTO_FOREST_ACCESS_TOKEN: process.env.NEXT_PUBLIC_CARTO_FOREST_ACCESS_TOKEN,
    NEXT_PUBLIC_CARTO_DEFORESTATION_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_CARTO_DEFORESTATION_ACCESS_TOKEN,
    NEXT_PUBLIC_CARTO_RADD_ACCESS_TOKEN: process.env.NEXT_PUBLIC_CARTO_RADD_ACCESS_TOKEN,
    NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE: process.env.NEXT_PUBLIC_FILE_UPLOADER_MAX_SIZE,
  },
});
