import { signIn, signOut } from 'next-auth/react';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add(
  'login',
  ({
    username = Cypress.env('USERNAME'),
    password = Cypress.env('PASSWORD'),
  } = {}): Cypress.Chainable => {
    cy.log('🔐 Sign in with Next Auth');

    cy.intercept('GET', '/api/auth/session', {
      fixture: 'auth/session.json',
    });

    cy.intercept('GET', '/api/v1/users/me', {
      fixture: 'auth/me.json',
    });

    return cy.session(['login', username, password], () => {
      cy.wrap(
        signIn('credentials', {
          redirect: false,
          username,
          password,
        }),
      );
    });
  },
);

Cypress.Commands.add('createScenario', (): void => {
  cy.log('Creates a scenario');

  cy.visit('/data/scenarios/new');
  cy.get('[data-testid="scenario-name-input"]').type('scenario mockup name');
  cy.get('[data-testid="scenario-description-input"]').type('scenario mockup description');
  // cy.get('[data-testid="scenario-form-validation-true"]').should('exist'); // wait for the validation
  cy.get('[data-testid="create-scenario-button"]').should('not.be.disabled').click();
});

Cypress.Commands.add('logout', (): Cypress.Chainable => {
  cy.log('logout');

  return cy.wrap(signOut({ redirect: false }));
});
