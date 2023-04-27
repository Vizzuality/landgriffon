describe('Analysis charts', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.login();
    cy.visit('/analysis/chart');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should load one chart per indicator', () => {
    cy.wait(['@fetchIndicators', '@fetchChartRanking']).then(() => {
      cy.get('[data-testid="analysis-chart"]').as('chart');
      cy.get('@chart').should('be.visible');
      cy.get('@chart').find('.recharts-responsive-container').and('have.length', 5);
    });
  });
});
