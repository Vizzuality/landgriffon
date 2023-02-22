// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login.
       * @example cy.login()
       */
      login(credentials?: { username?: string; password?: string }): Chainable<null>;
      logout(): Chainable<null>;
      createScenario(): Chainable<null>;
      interceptAllRequests(): Chainable<null>;
    }
  }
}

export {};
