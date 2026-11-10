import {defineConfig} from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:4174',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
  },
  viewportWidth: 1366,
  viewportHeight: 900,
  video: false,
  screenshotOnRunFailure: true,
  // A failing test stays a failure. Do not hide flaky tests with retries.
  retries: 0,
});
