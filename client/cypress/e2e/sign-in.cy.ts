describe('Sign in', () => {
  it('should sign in', () => {
    cy.viewport(1200, 800);
    cy.visit('/auth/signin');
    cy.get('[name="email"]').type(Cypress.env('USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'));
    cy.get('#signInForm').submit();
    cy.wait(1000);
    cy.url().should('contain', '/analysis');
  });
});
