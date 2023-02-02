describe('Analysis navigation and common behaviors', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators', {
      fixture: 'indicators/index',
    }).as('fetchIndicators');

    cy.intercept('GET', '/api/v1/indicators/*', {
      fixture: 'indicators/show',
    });

    cy.intercept('GET', '/api/v1/contextual-layers/categories', {
      fixture: 'layers/contextual-layer-categories.json',
    }).as('fetchContextualLayerCategories');

    cy.intercept('GET', '/api/v1/impact/ranking?*', {
      fixture: 'impact/chart',
    }).as('fetchChartRanking');

    cy.intercept('GET', '/api/v1/impact/table*', {
      fixture: 'impact/table',
    }).as('fetchImpactTable');

    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'impact/map',
    }).as('fetchImpactMap');

    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    });

    cy.intercept('GET', '/api/v1/materials/trees*', {
      statusCode: 200,
      fixture: 'trees/materials',
    });

    cy.intercept('GET', '/api/v1/suppliers/trees?withSourcingLocations=true', {
      statusCode: 200,
      fixture: 'trees/suppliers',
    });

    cy.intercept('GET', '/api/v1/sourcing-locations/location-types', {
      statusCode: 200,
      fixture: 'scenario/scenario-location-types',
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

  it('should be able to navigate to map, table, and chart', () => {
    cy.visit('/analysis');
    cy.wait(['@fetchImpactMap', '@fetchIndicators', '@fetchContextualLayerCategories']);
    cy.get('[data-testid="analysis-map"]').should('be.visible');
    cy.url().should('contain', '/analysis/map');

    cy.get('[data-testid="mode-control-table"]').click();
    cy.wait('@fetchImpactTable');
    cy.get('[data-testid="analysis-table"]').should('be.visible');
    cy.url().should('contain', '/analysis/table');

    cy.get('[data-testid="mode-control-chart"]').click();
    cy.wait('@fetchChartRanking');
    cy.get('[data-testid="analysis-charts"]').should('be.visible');
    cy.url().should('contain', '/analysis/chart');

    cy.get('[data-testid="mode-control-map"]').click();
    cy.get('[data-testid="analysis-map"]').should('be.visible');
    cy.url().should('contain', '/analysis/map');
  });
});
