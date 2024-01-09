describe('Analysis filters', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators?sort=name').as('fetchIndicators');
    cy.intercept('GET', '/api/v1/indicators?filter[status]=active').as('fetchActiveIndicators');
    cy.intercept('GET', '/api/v1/h3/years*').as('fetchYears');
    cy.intercept('GET', '/api/v1/materials/trees*').as('fetchMaterialsTrees');

    cy.login();
    cy.visit('/analysis/table');
  });

  afterEach(() => {
    cy.logout();
  });

  // Indicators
  it('filter by All indicator', () => {
    // select indicator
    cy.get('[data-testid="select-indicators-filter"]').find('button').click();
    cy.get('[data-testid="select-indicators-filter"] ul li:first').click();

    cy.url().should('include', 'indicator=all');
  });

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
      const firstActiveIndicator = interception.response.body?.data.find(
        ({ attributes }) => attributes.status === 'active',
      );
      // opens the select
      cy.get('[data-testid="select-indicators-filter"]').find('button').click();
      cy.get('[data-testid="select-indicators-filter"]')
        .find('li:not([data-headlessui-state="disabled"])')
        .eq(1)
        .should('contain', firstActiveIndicator?.attributes.name)
        .click();
      // url should include the active indicator
      cy.url().should('include', `indicator=${firstActiveIndicator?.id}`);
    });
  });

  // Group by filters
  it('filter by a group', () => {
    cy.get('[data-testid="select-group-filters"]').find('button').click();
    cy.get('[data-testid="select-group-filters"]')
      .find('li')
      .eq(2)
      .should('have.text', 'Region')
      .click();
    cy.url().should('include', 'by=region');
  });

  // Years
  it('filter by a range of years', () => {
    cy.wait('@fetchYears').then((interception) => {
      const firstYear = interception.response.body?.data[0];
      const lastYear =
        interception.response.body?.data[interception.response.body?.data.length - 1];
      cy.get('[data-testid="years-range-btn"]')
        .should('have.text', `from${firstYear} - ${lastYear + 5}`)
        .click();
      // cy.get('[data-testid="select-year-filter"]')
      //   .find('li')
      //   .eq(1)
      //   .should('have.text', lastYear)
      //   .click();
    });
  });
});
