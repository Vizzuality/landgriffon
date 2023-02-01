describe('Analysis navigation across table, map and chart', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators', {
      fixture: 'indicators/index.json',
    }).as('fetchIndicators');
    cy.intercept('GET', '/api/v1/impact/ranking?*', {
      fixture: 'impact/chart.json',
    }).as('fetchChartRanking');
    cy.intercept('GET', '/api/v1/impact/table*', {
      fixture: 'impact/table.json',
    }).as('fetchImpactTable');
    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'impact/map.json',
    }).as('fetchImpactMap');
    cy.intercept('GET', '/api/v1/contextual-layers/categories', {
      fixture: 'layers/contextual-layer-categories.json',
    }).as('fetchContextualLayerCategories');
    cy.intercept(
      {
        pathname: '**/h3data*',
        method: 'GET',
      },
      {
        fixture: 'layers/contextual-layer.json',
      },
    ).as('fetchContextualLayerH3Data');
    cy.login();
  });

  it('should load the charts', () => {
    cy.visit('/analysis/chart');
    cy.wait('@fetchIndicators');
    cy.wait('@fetchChartRanking');
    cy.get('[data-testid="analysis-chart"]')
      .should('be.visible')
      .find('.recharts-responsive-container')
      .and('have.length', 4);
  });

  it('should be able to navigate to map, table, and chart', () => {
    cy.visit('/analysis');
    cy.get('[data-testid="analysis-map"]', {
      timeout: 5000,
    }).should('be.visible');
    cy.url().should('contain', '/analysis/map');

    cy.get('[data-testid="mode-control-table"]').click();
    cy.get('[data-testid="analysis-table"]', {
      timeout: 5000,
    }).should('be.visible');
    cy.url().should('contain', '/analysis/table');

    cy.get('[data-testid="mode-control-chart"]').click();
    cy.get('[data-testid="analysis-charts"]', {
      timeout: 5000,
    }).should('be.visible');
    cy.url().should('contain', '/analysis/chart');

    cy.get('[data-testid="mode-control-map"]').click();
    cy.get('[data-testid="analysis-map"]', {
      timeout: 5000,
    }).should('be.visible');
    cy.url().should('contain', '/analysis/map');
  });

  it('contextual layer request does not include indicatorId as param', () => {
    cy.visit('/analysis/map');
    cy.wait('@fetchIndicators');
    cy.wait('@fetchContextualLayerCategories');
    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]')
      .find('[data-testid="switch-button"]')
      .click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    // cy.wait('@fetchContextualLayerH3Data').then((interception) => {
    //   expect(interception.request.url).not.to.contain('indicatorId');
    //   expect(interception.request.url).contain('year');
    //   expect(interception.request.url).contain('resolution=4');
    // });
    cy.wait('@fetchContextualLayerH3Data', {
      responseTimeout: 30000,
    }).its('request.url').should('not.contain', 'indicatorId');
  });
});
