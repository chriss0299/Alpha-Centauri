import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3003',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    env: {
      apiBaseUrl: 'http://localhost:3002/api/v1',
      testUserEmail: 'e2e@test.local',
      testUserPassword: 'E2EPass123!',
    },
  },
});
