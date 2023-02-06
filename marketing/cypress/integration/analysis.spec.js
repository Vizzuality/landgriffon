/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Navigation', () => {
  it('should navigate to the analysis page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/auth/sign-in')

    // Submit login form
    cy.get('form#signInForm #email').type('anyemail@anydomain.any');
    cy.get('form#signInForm #password').type('anypass');
    cy.get('form#signInForm').submit();

    // The login should fail and stay in the same page
    cy.url().should('include', '/auth/sign-in');
  });
});
