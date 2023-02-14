describe('Analysis and filters', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/impact/table*', {
      fixture: 'impact/table',
    }).as('impactTable');

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/indicators*',
      },
      {
        fixture: 'indicators/index',
      },
    ).as('fetchIndicators');

    cy.intercept('GET', '/api/v1/indicators/*', {
      fixture: 'indicators/show',
    });

    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    });

    cy.intercept('GET', '/api/v1/materials/trees?depth=1&withSourcingLocations=true', {
      fixture: 'trees/materials.json',
    }).as('materialsTrees');

    cy.intercept('GET', '/api/v1/admin-regions/trees?withSourcingLocations=true*', {
      fixture: 'trees/admin-regions.json',
    }).as('originsTrees');

    cy.intercept('GET', '/api/v1/suppliers/trees?withSourcingLocations=true', {
      fixture: 'trees/suppliers.json',
    }).as('suppliersTrees');

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/sourcing-locations/location-types/supported',
      },
      {
        fixture: 'sourcing-locations/supported',
      },
    );

    cy.intercept('GET', '/api/v1/scenarios*', {
      statusCode: 200,
      fixture: 'scenario/scenarios',
    });

    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should be able to select an indicator', () => {
    cy.intercept('GET', '/api/v1/indicators*', {
      fixture: 'indicators/index',
    }).as('fetchIndicators');

    cy.visit('/analysis/table');

    cy.wait('@fetchIndicators').then((interception) => {
      expect(interception.response.body?.data).have.length(5);
    });
    cy.get('[data-testid="analysis-table"]').should('be.visible');

    cy.url().should('not.include', 'indicator');

    // select indicator
    cy.get('[data-testid="select-indicators-filter"]').find('button').type('{enter}{enter}');

    cy.url().should('include', 'indicator=all');

    cy.get('[data-testid="select-indicators-filter"]')
      .find('button')
      .type('{enter}{downArrow}{enter}');

    cy.url().should('include', 'indicator=5c595ac7-f144-485f-9f32-601f6faae9fe'); // Land use
  });

  it('should update the params playing with the filters', () => {
    cy.visit('/analysis/table');

    // Step 1: open more filters
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@materialsTrees');
    cy.wait('@originsTrees');
    cy.wait('@suppliersTrees');

    // Adding new interceptors after selecting a filter
    cy.intercept(
      'GET',
      '/api/v1/suppliers/trees?*originIds[]=8bd7e578-f64f-4042-8a3a-2a7652ce850b*',
      {
        fixture: 'trees/suppliers-filtered.json',
      },
    ).as('suppliersTreesFiltered');

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/materials/trees',
        query: {
          'supplierIds[]': 'c8bca40d-1aec-44e3-b82b-8170898800ad',
        },
      },
      {
        fixture: 'trees/materials-filtered.json',
      },
    ).as('materialsTreesFiltered');

    // Step 2: Selecting Angola in the admin regions selector
    cy.get('[data-testid="tree-select-origins-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-origins-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode')
      .eq(1)
      .click();
    // cy.get('#floating-ui-root').find('.rc-tree-treenode').eq(1).click();
    cy.get('[data-testid="tree-select-origins-filter"]')
      .find('input:visible:first')
      .type('{enter}');

    // Step 3: Selecting Moll in the material selector
    cy.wait('@suppliersTreesFiltered');
    cy.get('[data-testid="tree-select-suppliers-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-suppliers-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode')
      .eq(1)
      .click();

    cy.get('[data-testid="tree-select-materials-filter"]')
      .find('input:visible:first')
      .type('{enter}');

    // Step 4: Checking material selector
    cy.wait('@materialsTreesFiltered')
      .its('request.url')
      .should('include', '8bd7e578-f64f-4042-8a3a-2a7652ce850b');
    cy.get('[data-testid="tree-select-materials-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-materials-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode:visible')
      .should('have.length', 1); // first treenode is empty
  });
});
