describe('Analysis and filters', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/impact/table*', {
      fixture: 'impact/table.json',
    }).as('impactTable');
    cy.login();
  });

  it('should be able to select and indicator', () => {
    // data integrity check
    cy.intercept('GET', '/api/v1/indicators', {
      fixture: 'indicators/index.json',
    }).as('indicators');
    cy.visit('/analysis/table');
    cy.wait('@indicators').then((interception) => {
      expect(interception.response.body?.data).have.length(4);
    });
    cy.get('[data-testid="analysis-table"]', {
      timeout: 5000,
    }).should('be.visible');

    cy.url().should('not.include', 'indicator');

    // select indicator
    cy.get('[data-testid="select-indicators-filter"]')
      .find('button')
      .click()
      .type('{downArrow}{enter}');

    cy.url().should('include', 'indicator=all');

    cy.get('[data-testid="select-indicators-filter"]')
      .find('button')
      .click()
      .type('{downArrow}{downArrow}{enter}');

    cy.wait(1000);

    cy.url().should('include', 'indicator=633cf928-7c4f-41a3-99c5-e8c1bda0b323');
  });

  it('should update the params playing with the filters', () => {
    cy.visit('/analysis/table');

    cy.intercept('GET', '/api/v1/materials/trees?depth=1&withSourcingLocations=true', {
      fixture: 'trees/materials.json',
    }).as('materialsTrees');
    cy.intercept('GET', '/api/v1/admin-regions/trees?withSourcingLocations=true', {
      fixture: 'trees/admin-regions.json',
    }).as('originsTrees');
    cy.intercept('GET', '/api/v1/suppliers/trees?withSourcingLocations=true', {
      fixture: 'trees/suppliers.json',
    }).as('suppliersTrees');

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
      'GET',
      '/api/v1/materials/trees?*supplierIds[]=c8bca40d-1aec-44e3-b82b-8170898800ad*',
      {
        fixture: 'trees/materials-filtered.json',
      },
    ).as('materialsTreesFiltered');

    // Step 2: Selecting Angola in the admin regions selector
    cy.get('[data-testid="tree-select-origins-filter"]').find('div[role="combobox"]').click();
    cy.get('#floating-ui-root').find('.rc-tree-treenode').eq(1).click();
    cy.get('[data-testid="tree-select-origins-filter"]')
      .find('input:visible:first')
      .type('{enter}');

    // Step 3: Selecting Moll in the material selector
    cy.wait('@suppliersTreesFiltered');
    cy.get('[data-testid="tree-select-suppliers-filter"]').find('div[role="combobox"]').click();
    cy.get('#floating-ui-root').find('.rc-tree-treenode').eq(1).click();
    cy.get('[data-testid="tree-select-materials-filter"]')
      .find('input:visible:first')
      .type('{enter}');

    // Step 4: Checking material selector
    cy.wait('@materialsTreesFiltered')
      .its('request.url')
      .should('include', '8bd7e578-f64f-4042-8a3a-2a7652ce850b');
    cy.get('[data-testid="tree-select-materials-filter"]').find('div[role="combobox"]').click();
    cy.get('#floating-ui-root').find('.rc-tree-treenode:visible').should('have.length', 1); // first treenode is empty
  });
});
