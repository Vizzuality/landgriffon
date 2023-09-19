describe('Sign in', () => {
  afterEach(() => {
    cy.logout();
  });

  it('should sign in', () => {
    cy.intercept('GET', '/api/auth/session').as('signInRequest');
    cy.visit('/auth/signin');
    cy.get('[name="email"]').type(Cypress.env('USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait('@signInRequest');
    cy.url().should('contain', 'analysis');
  });
});
