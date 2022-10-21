import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    screenshotOnRunFailure: false,
    video: false,
    videoUploadOnPasses: false,
    experimentalSessionAndOrigin: true,
    viewportWidth: 1280,
    viewportHeight: 920,
  },
});
