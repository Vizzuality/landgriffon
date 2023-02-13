describe('Analysis charts', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators', {
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
    cy.wait('@fetchIndicators');
    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/indicators',
        query: {
          'filter[status]': 'active',
        },
      },
      {
        fixture: 'indicators/index',
      },
    ).as('fetchIndicatorsStatusActive');
    cy.wait('@fetchIndicatorsStatusActive');
    cy.wait('@fetchChartRanking');
    cy.get('[data-testid="analysis-chart"]')
      .should('be.visible')
      .find('.recharts-responsive-container')
      .and('have.length', 5); // only 5 are active
  });
});
