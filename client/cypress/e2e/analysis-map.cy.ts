describe('Analysis map', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators', {
      fixture: 'indicators/index.json',
    }).as('fetchIndicators');
    cy.intercept('GET', '/api/v1/indicators/*', {
      fixture: 'indicators/show.json',
    });
    cy.intercept('GET', '/api/v1/contextual-layers/categories', {
      fixture: 'layers/contextual-layer-categories.json',
    }).as('fetchContextualLayerCategories');
    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'layers/impact-layer.json',
    });
    cy.login();
    cy.visit('/analysis/map');
  });

  it('contextual layer request does not include indicatorId as param', () => {
    cy.wait('@fetchIndicators');
    cy.wait('@fetchContextualLayerCategories');

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/contextual-layers/*/h3data',
      },
      {
        fixture: 'layers/contextual-layer.json',
      },
    ).as('fetchContextualLayerH3Data');

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]', {
      timeout: 5000,
    })
      .find('[data-testid="switch-button"]')
      .click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchContextualLayerH3Data', { requestTimeout: 30000 }).then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });
});
