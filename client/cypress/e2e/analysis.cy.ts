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

    cy.intercept('GET', '/api/v1/impact/compare/scenario/vs/actual?*', {
      statusCode: 200,
      fixture: 'scenario/scenario-vs-actual',
    }).as('scenarioVsActual');

    cy.intercept('GET', '/api/v1/impact/compare/scenario/vs/scenario?*', {
      statusCode: 200,
      fixture: 'scenario/scenario-vs-scenario',
    }).as('scenarioVsScenario');

    cy.login();
  });

  it('should be able to see the analysis page', () => {
    cy.visit('/analysis/map');
    cy.url().should('contain', '/analysis/map');
  });

  it('should be scenarioIds empty when there is no scenario selected in the more filters endpoints', () => {
    cy.intercept('GET', '/api/v1/**/trees?*').as('treesSelectors');
    cy.visit('/analysis/table');
    cy.wait('@treesSelectors').then((interception) => {
      const url = new URL(interception.request.url);
      const scenarioIds = url.searchParams.get('scenarioIds');
      expect(scenarioIds).to.be.null;
    });
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');

    cy.intercept(
      'GET',
      '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    ).as('treesSelectorsWithScenarioId');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="comparison-select"]')
      .click()
      .find('input:visible')
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking comparison cell is there
    cy.wait('@scenarioVsActual');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');
    cy.wait('@scenariosList');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="scenario-item-radio"]')
      .click();

    cy.url().should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.intercept({
      path: '/api/v1/**/trees?*scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('treesSelectorsWithBothScenarioIds');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="comparison-select"]')
      .click()
      .find('input:visible')
      .type('Example{enter}');

    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithBothScenarioIds')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .and('contain', 'scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking comparison cell is there
    cy.wait('@scenarioVsScenario');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);
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
