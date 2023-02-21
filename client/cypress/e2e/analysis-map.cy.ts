describe('Analysis map', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators*', {
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

    cy.intercept('GET', '/api/v1/h3/map/material*', {
      fixture: 'layers/material-layer.json',
    }).as('fetchMaterialLayerH3Data');

    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'layers/impact-layer.json',
    });

    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    });

    cy.intercept('GET', '/api/v1/materials/*', {
      fixture: 'materials/show.json',
    });

    cy.intercept('GET', '/api/v1/materials/trees?*', {
      statusCode: 200,
      fixture: 'trees/materials',
    });

    cy.intercept('GET', '/api/v1/suppliers/trees?withSourcingLocations=true', {
      statusCode: 200,
      fixture: 'trees/suppliers',
    });

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/sourcing-locations/location-types/supported',
      },
      {
        fixture: 'sourcing-locations/supported',
      },
    );

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

  it('contextual material layer request does not include indicatorId as param', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="contextual-material-header"]')
      .click()
      .find('[data-testid="switch-button"]')
      .click();
    cy.wait(100);
    cy.get('[data-testid="contextual-material-content"]')
      .find('[data-testid="tree-select-material"]')
      .find('input[type="search"]')
      .type('Cotton');
    cy.get('[data-testid="tree-select-search-results"]').find('button').click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchMaterialLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });
});
