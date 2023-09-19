describe('Analysis filters', () => {
  beforeEach(() => {
    // cy.interceptAllRequests();
    cy.loginWithFixtures();
    cy.visit('/analysis/table');
  });

  afterEach(() => {
    cy.logout();
  });

  // it('should be able to select all indicator', () => {
  //   cy.wait('@fetchIndicators').then((interception) => {
  //     expect(interception.response.body?.data).have.length(5);
  //   });

  //   cy.url().should('not.include', 'indicator');

  //   // select indicator
  //   cy.get('[data-testid="select-indicators-filter"]').find('button').click();
  //   cy.get('[data-testid="select-indicators-filter"] ul li:first').click();

  //   cy.url().should('include', 'indicator=all');
  // });

  // it('should be able to filter by Land use indicator', () => {
  //   cy.wait('@fetchIndicators').then((interception) => {
  //     expect(interception.response.body?.data).have.length(5);
  //   });

  //   cy.url().should('not.include', 'indicator');

  //   cy.get('[data-testid="select-indicators-filter"]').find('button').click();
  //   cy.get('[data-testid="select-indicators-filter"] ul li:first').next().click();

  //   cy.url().should('include', 'indicator=5c595ac7-f144-485f-9f32-601f6faae9fe'); // Land use
  // });

  it('should be able to filter by a material', () => {
    cy.intercept('GET', '/api/v1/materials/trees*').as('materialsTrees');

    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@materialsTrees');
    cy.get('[data-testid="tree-select-t1-suppliers-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-t1-suppliers-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode')
      .eq(1)
      .click();
  });

  // it('should update the URL params selecting multiple filters', () => {
  //   // Step 1: open more filters
  //   cy.get('[data-testid="more-filters-button"]').click();
  //   cy.wait(['@materialsTrees', '@originsTrees', '@t1Suppliers', '@fetchImpactTable']);

  //   // Adding new interceptors after selecting a filter
  //   cy.intercept(
  //     'GET',
  //     '/api/v1/suppliers/types?*originIds[]=8bd7e578-f64f-4042-8a3a-2a7652ce850b*',
  //     {
  //       fixture: 'trees/suppliers-filtered.json',
  //     },
  //   ).as('t1SuppliersFiltered');

  //   cy.intercept(
  //     {
  //       method: 'GET',
  //       pathname: '/api/v1/materials/trees',
  //       query: {
  //         'supplierIds[]': 'c8bca40d-1aec-44e3-b82b-8170898800ad',
  //       },
  //     },
  //     {
  //       fixture: 'trees/materials-filtered.json',
  //     },
  //   ).as('materialsTreesFiltered');
  //   cy.wait('@locationTypes');

  //   // Step 2: Selecting Angola in the admin regions selector
  //   cy.get('[data-testid="tree-select-origins-filter"]').find('div[role="combobox"]').click();
  //   cy.get('[data-testid="tree-select-origins-filter"]')
  //     .find('div[role="listbox"]')
  //     .find('.rc-tree-treenode')
  //     .eq(1)
  //     .click();
  //   cy.get('[data-testid="tree-select-origins-filter"]')
  //     .find('input:visible:first')
  //     .type('{enter}');
  //   cy.wait('@locationTypes');
  //   // Step 3: Selecting Moll in the material selector
  //   cy.wait('@t1SuppliersFiltered');
  //   cy.get('[data-testid="tree-select-t1-suppliers-filter"]').find('div[role="combobox"]').click();
  //   cy.get('[data-testid="tree-select-t1-suppliers-filter"]')
  //     .find('div[role="listbox"]')
  //     .find('.rc-tree-treenode')
  //     .eq(1)
  //     .click();
  //   cy.wait('@locationTypes');
  //   // Step 4: Checking material selector
  //   cy.wait('@materialsTreesFiltered')
  //     .its('request.url')
  //     .should('include', '8bd7e578-f64f-4042-8a3a-2a7652ce850b');

  //   cy.get('[data-testid="tree-select-materials-filter"]').find('div[role="combobox"]').click();
  //   cy.get('[data-testid="tree-select-materials-filter"]')
  //     .find('div[role="listbox"]')
  //     .find('.rc-tree-treenode:visible')
  //     .should('have.length', 1); // first treenode is empty
  // });
});
