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

Cypress.Commands.add('logout', (): Cypress.Chainable => {
  cy.log('logout');
  return cy.wrap(signOut({ redirect: false }));
});
