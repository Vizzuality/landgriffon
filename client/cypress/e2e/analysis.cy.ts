describe('Analysis navigation across table, map and chart', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/impact/ranking?*').as('fetchChartRanking');
    cy.login();
  });

  it('should load the charts', () => {
    cy.visit('/analysis/chart');
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
});
