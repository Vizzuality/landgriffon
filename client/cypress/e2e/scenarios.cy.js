describe('Scenarios', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should be able to see the scenarios page', () => {
    cy.visit('/admin/scenarios');
    cy.url().should('contain', '/admin/scenarios');
    cy.get('h1').contains('Manage scenarios data');
  });
});
