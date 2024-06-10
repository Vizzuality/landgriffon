describe('Analysis filters', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/indicators?sort=name').as('fetchIndicators');
    cy.intercept('GET', '/api/v1/indicators?filter[status]=active', {
      statusCode: 200,
      fixture: 'indicators/index',
    }).as('fetchActiveIndicators');
    cy.intercept('GET', '/api/v1/h3/years*', {
      statusCode: 200,
      fixture: 'years/index',
    }).as('fetchYears');
    cy.intercept('GET', '/api/v1/materials/trees*').as('fetchMaterialsTrees');

    cy.intercept('GET', '/api/v1/impact/table*').as('fetchTableData');

    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  // Indicators
  it('/analysis/table page without indicators in URL displays all active indicators', () => {
    cy.visit('/analysis/table');

    cy.wait(['@fetchActiveIndicators', '@fetchTableData']).then((interception) => {
      const allIndicators = interception[0].response.body?.data?.length;
      const dataTableRequest = interception[1];

      expect(dataTableRequest.request.query.indicatorIds).to.deep.eq(
        interception[0].response.body?.data.map(({ id }) => id),
      );

      cy.get('[data-testid="analysis-table"]')
        .find('table > tbody > tr[class="group"]')
        .should('have.length', allIndicators);

      cy.url().should('not.include', 'indicator=all');
    });
  });

  it('selecting multiple indicators will filter the data of the table', () => {
    cy.visit('/analysis/table');

    cy.wait(['@fetchActiveIndicators', '@fetchTableData']).then((interception) => {
      const indicators = interception[0].response.body?.data;
      const waterQuality = indicators.filter(
        ({ attributes }) => attributes.category === 'Water quality',
      );

      const $indicatorSelector = cy.get('[data-testid="tree-select-indicators"]');
      $indicatorSelector.click().type('Water quality');

      $indicatorSelector
        .find('[data-testid="tree-select-search-results"]')
        .contains('Water quality')
        .click();

      cy.url().should('include', `indicators=${waterQuality.map(({ id }) => id).join(',')}`);

      cy.get('[data-testid="analysis-table"]')
        .find('table > tbody > tr[class="group"]')
        .should('have.length', waterQuality?.length);
    });
  });

  it('an user inspects one of the indicators in detail', () => {
    cy.visit('/analysis/table');

    cy.wait(['@fetchActiveIndicators', '@fetchTableData']).then((interception) => {
      const indicators = interception[0].response.body?.data;
      const waterQuality = indicators.filter(
        ({ attributes }) => attributes.category === 'Water quality',
      );

      const $indicatorSelector = cy.get('[data-testid="tree-select-indicators"]');

      const $tableHeader = cy
        .get('[data-testid="analysis-table"]')
        .find('table > thead > tr')
        .first();

      const $tableRows = cy
        .get('[data-testid="analysis-table"]')
        .find('table > tbody > tr[class="group"]');

      $indicatorSelector.click().type('Water quality');

      $indicatorSelector
        .find('[data-testid="tree-select-search-results"]')
        .contains('Water quality')
        .click();

      cy.wait('@fetchTableData');

      $tableRows.should('have.length', waterQuality?.length);

      $tableRows.first().find('button').contains('View detail').click();

      $tableHeader.contains(waterQuality[1].attributes.name);

      cy.url().should(
        'include',
        `indicators=${waterQuality.map(({ id }) => id).join(',')}&detail=${waterQuality[1].id}`,
      );
    });
  });

  // // Group by filters
  it('filter by a group', () => {
    cy.visit('/analysis/table');

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
    cy.visit('/analysis/table');

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
