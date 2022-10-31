describe('Analysis navigation across table, map and chart', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should load the charts', () => {
    cy.visit('/analysis/chart');
    cy.wait(1000);
    cy.get('[data-testid=analysis-chart]')
      .should('be.visible')
      .find('h2').and('have.length', 4);
  })

  it('should be able to navigate to map, table, and chart', () => {
    cy.visit('/analysis');
    cy.wait(1000);
    cy.url().should('contain', '/analysis/map');

    cy.get('[data-testid="mode-control-table"]').click();
    cy.wait(1000);
    cy.url().should('contain', '/analysis/table');

    cy.get('[data-testid="mode-control-chart"]').click();
    cy.wait(1000);
    cy.url().should('contain', '/analysis/chart');

    cy.get('[data-testid="mode-control-map"]').click();
    cy.wait(1000);
    cy.url().should('contain', '/analysis/map');
  });
});
