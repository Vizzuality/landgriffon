describe('Sign in', () => {
  it('should sign in', () => {
    cy.visit('/auth/sign-in');
    cy.get('[name="username"]').type(Cypress.env('USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'));
    cy.get('#signInForm').submit();
    cy.wait(1000);
    cy.url().should('contain', '/analysis');
  });
});
