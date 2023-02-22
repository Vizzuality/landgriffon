import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 90000,
  requestTimeout: 90000,
  responseTimeout: 90000,
  execTimeout: 90000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    screenshotOnRunFailure: true,
    video: false,
    videoUploadOnPasses: false,
    viewportWidth: 1280,
    viewportHeight: 920,
  },
});
