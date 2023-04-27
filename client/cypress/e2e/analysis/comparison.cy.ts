describe('Analysis comparison', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.intercept(
      'GET',
      '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    ).as('treesSelectorsWithScenarioId');

    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .focus()
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking comparison cell is there
    cy.wait('@scenarioVsActual')
      .its('request.url')
      .should('contain', 'comparedScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.intercept(
      'GET',
      '/api/v1/impact/table?*scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7*',
    ).as('fetchImpactTableData');

    // ? locations filtered by comparison of a scenario
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    }).as('locationTypesWithSingleScenario');

    // ? locations filtered by comparison of two scenarios
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7&scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('locationTypesWithScenarioComparison');

    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');
    cy.wait('@scenariosList');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="scenario-item-radio"]')
      .click();

    cy.wait('@fetchImpactTableData')
      .its('request.url')
      .should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.url().should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.intercept({
      path: '/api/v1/**/trees?*scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('treesSelectorsWithBothScenarioIds');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .focus()
      .type('Example{enter}');

    cy.wait('@locationTypesWithSingleScenario').its('response.statusCode').should('eq', 200);

    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithBothScenarioIds')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .and('contain', 'scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    cy.wait('@locationTypesWithScenarioComparison').its('response.statusCode').should('eq', 200);

    // checking comparison cell is there
    cy.wait('@scenarioVsScenario')
      .its('request.url')
      .should('contain', 'comparedScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);
  });
});
