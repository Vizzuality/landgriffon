describe('Analysis', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
      statusCode: 200,
      fixture: 'scenario/scenarios',
    }).as('scenariosNoPaginated');

    cy.intercept(
      'GET',
      '/api/v1/scenarios?page[number]=1&page[size]=10&sort=-updatedAt&include=scenarioInterventions',
      {
        statusCode: 200,
        fixture: 'scenario/scenarios',
      },
    ).as('scenariosList');

    cy.login();
  });

  it('should be able to see the analysis page', () => {
    cy.visit('/analysis/map');
    cy.url().should('contain', '/analysis/map');
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');
    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="comparison-select"]')
      .click()
      .find('input:visible')
      .type('Test{enter}');
    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');
    cy.wait('@scenariosList');
    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="scenario-item-radio"]')
      .click();
    cy.url().should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="comparison-select"]')
      .click()
      .find('input:visible')
      .type('Example{enter}');
    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');
  });

  it('should be able to navigate to map, table, and chart', () => {
    cy.visit('/analysis');
    cy.url().should('contain', '/analysis/map');

    cy.get('[data-testid="mode-control-table"]').click();
    cy.url().should('contain', '/analysis/table');

    cy.get('[data-testid="mode-control-chart"]').click();
    cy.url().should('contain', '/analysis/chart');

    cy.get('[data-testid="mode-control-map"]').click();
    cy.url().should('contain', '/analysis/map');
  });
});
