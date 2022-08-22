beforeEach(() => {
  cy.createScenario();
  cy.visit('/admin/scenarios/some-random-id/interventions/new');
});

afterEach(() => {
  cy.logout();
});

describe('Intervention creation', () => {
  it('should show the page', () => {
    cy.url().should('contains', '/interventions/new');
    cy.get('[data-testid="page-title"]').should('have.text', 'New intervention');
  });
});
