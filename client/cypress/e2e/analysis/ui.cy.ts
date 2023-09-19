describe('Analysis tab', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.loginWithFixtures();
    cy.visit('/analysis');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should navigate to map, table, and chart', () => {
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
