/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Navigation', () => {
  it(
    'should not login with incorrect credentials',
    { env: { USERNAME: 'anyemail@anydomain.any', PASSWORD: 'clearly incorrect password' } },
    () => {
      cy.login();
      cy.visit('/');

      cy.url().should('include', '/auth/sign-in');
    },
  );

  it('should login with correct credentials', () => {
    cy.login();
    cy.visit('/');

    cy.url().should('not.contain', '/auth/sign-in');
  });
});
