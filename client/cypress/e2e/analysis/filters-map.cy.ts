describe('Analysis filters', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators?sort=name').as('fetchIndicators');
    cy.intercept('GET', '/api/v1/indicators?filter[status]=active').as('fetchActiveIndicators');
    cy.intercept('GET', '/api/v1/h3/years*').as('fetchYears');
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
  it('not to filter by a disabled indicator', () => {
    cy.intercept('GET', '/api/v1/indicators*', {
      fixture: 'indicators/index',
    }).as('fetchIndicators');

    cy.wait('@fetchIndicators').then((interception) => {
      const firstDisabledIndicator = interception.response.body?.data.find(
        ({ attributes }) => attributes.status === 'inactive',
      );
      // opens the select
      cy.get('[data-testid="select-indicators-filter"]').find('button').click();
      cy.get('[data-testid="select-indicators-filter"]')
        .find('li[data-headlessui-state="disabled"]')
        .first()
        .should('contain', firstDisabledIndicator?.attributes.name)
        .should('have.attr', 'aria-disabled', 'true');
      // url should not include the disabled indicator
      cy.url().should('not.include', `indicator=${firstDisabledIndicator?.id}`); // Land use
    });
  });

  it('filter by an active indicator', () => {
    cy.wait('@fetchIndicators').then((interception) => {
      const activeIndicators = interception.response.body?.data.filter(
        ({ attributes }) => attributes.status === 'active',
      );
      // opens the select
      cy.get('[data-testid="select-indicators-filter"]').find('button').click();
      cy.get('[data-testid="select-indicators-filter"]')
        .find('li:not([data-headlessui-state="disabled"])')
        .eq(1)
        .should('contain', activeIndicators[1]?.attributes.name)
        .click();
      // url should include the active indicator
      cy.url().should('include', `indicator=${activeIndicators[1]?.id}`);
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
        .find('.rc-tree-list')
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
