describe('Analysis charts', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators*', {
      fixture: 'indicators/index',
    }).as('fetchIndicators');

    cy.intercept('GET', '/api/v1/impact/ranking?*', {
      fixture: 'impact/chart',
    }).as('fetchChartRanking');

    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    });

    cy.intercept('GET', '/api/v1/materials/trees?depth=1&withSourcingLocations=true', {
      statusCode: 200,
      fixture: 'trees/materials',
    });

    cy.intercept('GET', '/api/v1/suppliers/trees?withSourcingLocations=true', {
      statusCode: 200,
      fixture: 'trees/suppliers',
    });

    cy.intercept('GET', '/api/v1/sourcing-locations/location-types/supported', {
      statusCode: 200,
      fixture: 'sourcing-locations/supported',
    });

    cy.intercept('GET', '/api/v1/admin-regions/trees?withSourcingLocations=true', {
      statusCode: 200,
      fixture: 'trees/admin-regions',
    });

    cy.intercept('GET', '/api/v1/scenarios*', {
      statusCode: 200,
      fixture: 'scenario/scenarios',
    });

    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should load the charts', () => {
    cy.visit('/analysis/chart');

    cy.wait(['@fetchIndicators', '@fetchChartRanking']).then(() => {
      cy.get('[data-testid="analysis-chart"]').as('chart');
      cy.get('@chart').should('be.visible');
      cy.get('@chart').find('.recharts-responsive-container').and('have.length', 5);
    });
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.wait('@scenariosNoPaginated');

    cy.intercept(
      'GET',
      '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    ).as('treesSelectorsWithScenarioId');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking the charts
    cy.get('[data-testid="analysis-chart"]').should('not.be.empty');
  });
});
