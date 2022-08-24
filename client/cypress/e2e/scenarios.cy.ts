beforeEach(() => {
  cy.intercept('GET', '/api/v1/scenarios/**/interventions', {
    statusCode: 200,
    fixture: 'scenario/scenario-interventions',
  });

  cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
    statusCode: 200,
    fixture: 'scenario/scenarios',
  });

  cy.login();
  cy.visit('/admin/scenarios');
});

afterEach(() => {
  cy.logout();
});

describe('Scenarios', () => {
  it('should be able to see the scenarios page', async () => {
    cy.url().should('contain', '/admin/scenarios');
    cy.get('h1').should('have.text', 'Manage scenarios data');
    cy.log('Scenarios is selected in the menu bar');
    cy.get('[data-testisactive="true"]').should('have.text', 'Scenarios');
  });

  it('should show same scenarios cards length than API', () => {
    cy.get('[data-testid="scenario-card"]').should('have.length', 4);
  });

  it('should every scenario have interventions', () => {
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-interventions-item"]')
      .should('have.length', 2);
  });

  it('should allow create new scenarios and come back', () => {
    cy.get('[data-testid="scenario-add-button"]').should('have.text', 'Add scenario').click();

    cy.url().should('contain', '/admin/scenarios/new');

    cy.get('[data-testid="scenario-back-button"]')
      .click()
      .url()
      .should('contain', '/admin/scenarios');
  });
});
