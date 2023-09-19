describe('Analysis contextual layers', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.loginWithFixtures();
    cy.visit('/analysis/map');
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);
    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.wait(301); // waiting for the modal to open
    cy.get('[data-testid="contextual-layer-apply-button"').should('be.visible');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should be able to choice a contextual layer', () => {
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]')
      .find('[data-testid="switch-button"]')
      .click();
    cy.wait(200);
    cy.get('[data-testid="contextual-layer-apply-button"').click();
    cy.wait(300);
    cy.get('[data-testid="contextual-layer-apply-button"').should('not.exist');
  });

  it('should be able to choice a material contextual layer', () => {
    cy.get('[data-testid="contextual-material-header"]')
      .click()
      .find('[data-testid="switch-button"]')
      .click();
    cy.wait(200);
    cy.get('[data-testid="contextual-material-content"]')
      .find('[data-testid="tree-select-material"]')
      .find('input[type="search"]')
      .type('Cotton');
    cy.get('[data-testid="tree-select-search-results"]').find('button').click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();
    cy.wait(300);
    cy.get('[data-testid="contextual-layer-apply-button"').should('not.exist');
  });
});
