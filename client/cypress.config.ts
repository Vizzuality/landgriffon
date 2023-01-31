import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    screenshotOnRunFailure: false,
    video: false,
    videoUploadOnPasses: false,
    viewportWidth: 1280,
    viewportHeight: 920,
  },
});
