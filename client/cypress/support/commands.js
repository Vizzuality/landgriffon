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

Cypress.Commands.add('login', () => {
  cy.visit('/auth/sign-in');
  cy.get('[name="username"]').type(Cypress.env('username'));
  cy.get('[name="password"]').type(Cypress.env('password'));
  cy.get('#signInForm').submit();
  cy.wait(1000);
  cy.url().should('contain', '/analysis');
});

// Cypress.Commands.add('login', () => {
//   cy.request({
//     url: '/api/auth/signin/credentials', // assuming you've exposed a seeds route
//     method: 'POST',
//     body: { username: process.env.CYPRESS_USERNAME, password: process.env.CYPRESS_PASSWORD },
//   })
//     .its('body')
//     .then((body) => {
//       // assuming the server sends back the user details
//       // including a randomly generated password
//       //
//       // we can now login as this newly created user
//       cy.request({
//         url: '/login',
//         method: 'POST',
//         body: {
//           email: body.email,
//           password: body.password,
//         },
//       });
//     });
// });
