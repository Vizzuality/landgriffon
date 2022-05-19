// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.addAll({
  dataCy(id) {
    return cy.get(`[data-cy=${id}]`);
  },
  login() {
    cy.intercept({ method: 'POST', url: '/api/auth/callback/credentials*' }).as('login');
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');
    cy.session([username, password], () => {
      cy.visit('/');
      cy.dataCy('username').type(username);
      cy.dataCy('password').type(password);
      cy.dataCy('sign-in').click();
      cy.wait('@login');
    });
  },
});
