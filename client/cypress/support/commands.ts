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

Cypress.Commands.add('login', (): Cypress.Chainable => {
  cy.log('🔐 Sign in with Next Auth');
  return cy.wrap(
    signIn('credentials', {
      redirect: false,
      username: Cypress.env('USERNAME'),
      password: Cypress.env('PASSWORD'),
    }),
  );
});

Cypress.Commands.add('createScenario', (): void => {
  cy.log('Creates a scenario');

  cy.login().visit('/admin/scenarios/new');
  cy.get('[data-testid="scenario-name-input"]').type('scenario mockup name');
  cy.get('[data-testid="scenario-description-input"]').type('scenario mockup description');
  cy.get('[data-testid="create-scenario-button"]').click();
});

Cypress.Commands.add('logout', (): Cypress.Chainable => {
  cy.log('logout');
  return cy.wrap(signOut({ redirect: false }));
});
