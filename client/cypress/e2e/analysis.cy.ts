describe('Analysis navigation and common behaviors', () => {
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
    cy.login();
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
});
