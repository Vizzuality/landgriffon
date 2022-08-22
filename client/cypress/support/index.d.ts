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
      login(): Chainable<Element>;
      logout(): Chainable<Element>;
      createScenario(): Chainable<Element>;
    }
  }
}

export {};
