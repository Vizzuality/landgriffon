describe('Analysis', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should be able to see the analysis page', () => {
    cy.visit('/analysis');
    cy.url().should('contain', '/analysis');
  });
});
