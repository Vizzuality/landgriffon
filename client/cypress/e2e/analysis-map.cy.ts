describe('Analysis map', () => {
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

    cy.intercept('GET', '/api/v1/contextual-layers/*/h3data*', {
      fixture: 'layers/contextual-layer.json',
    }).as('fetchContextualLayerH3Data');

    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'layers/impact-layer.json',
    });

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

    cy.intercept('GET', '/api/v1/sourcing-locations/location-types/supported', {
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
    cy.visit('/analysis/map');
  });

  afterEach(() => {
    cy.logout();
  });

  it('contextual layer request does not include indicatorId as param', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]')
      .find('[data-testid="switch-button"]')
      .click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchContextualLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });
});
