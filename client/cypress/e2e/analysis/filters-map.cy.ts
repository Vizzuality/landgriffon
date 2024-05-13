describe('Analysis filters', () => {
  beforeEach(() => {
    // cy.intercept('GET', '/api/v1/indicators?sort=name', {
    //   fixture: 'indicators/index',
    // }).as('fetchIndicators');
    cy.intercept('GET', '/api/v1/indicators*', {
      fixture: 'indicators/index',
    }).as('fetchActiveIndicators');
    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    }).as('fetchYears');
    cy.intercept('GET', '/api/v1/materials/trees*').as('fetchMaterialsTrees');
    cy.intercept('GET', '/api/v1/admin-regions/trees*').as('fetchOriginsTrees');
    cy.intercept('GET', '/api/v1/suppliers/types?type=t1supplier').as('fetchT1Suppliers');
    cy.intercept('GET', '/api/v1/suppliers/types?type=producer').as('fetchProducers');
    cy.intercept('GET', '/api/v1/sourcing-locations/location-types?sort=DESC').as(
      'fetchLocationTypes',
    );

    cy.login();
    cy.visit('/analysis/map');
  });

  afterEach(() => {
    cy.logout();
  });

  // Indicators
  it('arriving to /analysis/map without params will load the first active indicator available and reflect it in the URL', () => {
    cy.wait('@fetchActiveIndicators').then((interception) => {
      const firstIndicator = interception.response.body?.data[0];
      cy.get('[data-testid="select-indicators-filter"]').should(
        'contain',
        firstIndicator?.attributes.name,
      );
      cy.url().should('include', `indicators=${firstIndicator?.id}`);
    });
  });

  it('in analysis map, selecting an indicator will update the URL accordingly ', () => {
    cy.wait('@fetchActiveIndicators').then((interception) => {
      const thirdIndicator = interception.response.body?.data[2];
      cy.get('[data-testid="select-indicators-filter"]')
        .type('{downarrow}{downarrow}{enter}')
        .should('contain', thirdIndicator?.attributes.name);
      cy.url().should('include', `indicators=${thirdIndicator?.id}`);
    });
  });

  // Years
  it('filter by a year', () => {
    cy.wait('@fetchYears').then((interception) => {
      const secondYear = interception.response.body?.data[1];
      cy.get('[data-testid="select-year-filter"]').find('button').click();
      cy.get('[data-testid="select-year-filter"]')
        .find('li')
        .eq(1)
        .should('have.text', secondYear)
        .click();
    });
  });

  // Other filters: Materials
  it('filter by a material and/or some of them', () => {
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@fetchMaterialsTrees').then((interception) => {
      const firstItem = interception.response.body?.data[0];
      cy.get('[data-testid="tree-select-materials-filter"]').find('div[role="combobox"]').click();
      cy.get('[data-testid="tree-select-materials-filter"]')
        .find('div[role="listbox"]')
        .find('.rc-tree-treenode')
        .eq(1)
        .should('have.text', firstItem.attributes.name)
        .click();
    });
  });

  // Other filters: Regions
  it('filter by an origin and/or some of them', () => {
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@fetchOriginsTrees').then((interception) => {
      const firstItem = interception.response.body?.data[0];
      cy.get('[data-testid="tree-select-origins-filter"]').find('div[role="combobox"]').click();
      cy.get('[data-testid="tree-select-origins-filter"]')
        .find('div[role="listbox"]')
        .find('.rc-tree-treenode')
        .eq(1)
        .should('have.text', firstItem.attributes.name)
        .click();
    });
  });

  // Other filters: T1 suppliers
  it('filter by a T1 supplier', () => {
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@fetchT1Suppliers').then((interception) => {
      const firstItem = interception.response.body?.data[0];
      cy.get('[data-testid="tree-select-t1-suppliers-filter"]')
        .find('div[role="combobox"]')
        .click();
      cy.get('[data-testid="tree-select-t1-suppliers-filter"]')
        .find('div[role="listbox"]')
        .find('.rc-tree-treenode')
        .eq(1)
        .should('have.text', firstItem.attributes.name)
        .click();
    });
  });

  // Other filters: Producers
  it('filter by a producer', () => {
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@fetchProducers').then((interception) => {
      const firstItem = interception.response.body?.data[0];
      cy.get('[data-testid="tree-select-producers-filter"]').find('div[role="combobox"]').click();
      cy.get('[data-testid="tree-select-producers-filter"]')
        .find('div[role="listbox"]')
        .find('.rc-tree-treenode')
        .eq(1)
        .should('have.text', firstItem.attributes.name)
        .click();
    });
  });

  // Other filters: Location types
  it('filter by a location type', () => {
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@fetchLocationTypes').then((interception) => {
      const firstItem = interception.response.body?.data[0];
      cy.get('[data-testid="select-location-type-filter"]').find('button').click();
      cy.get('[data-testid="select-location-type-filter"]')
        .find('li')
        .first()
        .should('have.text', firstItem.label)
        .click();
    });
  });
});
