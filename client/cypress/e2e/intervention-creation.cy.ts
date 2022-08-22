beforeEach(() => {
  // cy.login();
  // cy.visit('/admin/scenarios/new');
  cy.createScenario();
});

after(() => {
  cy.logout();
});

describe('Intervention creation', () => {
  it('should show the page', () => {
    cy.url().should('contains', '/interventions/new');
    cy.get('[data-testid="page-title"]').should('have.text', 'New intervention');
  });
});
