describe('Analysis charts', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators', {
      fixture: 'indicators/index.json',
    }).as('fetchIndicators');
    cy.intercept('GET', '/api/v1/impact/ranking?*', {
      fixture: 'impact/chart.json',
    }).as('fetchChartRanking');
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
});
