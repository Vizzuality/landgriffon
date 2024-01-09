import {
  DEFAULT_END_YEAR_GAP,
  MAX_END_YEAR_RANGE,
} from '../../../src/containers/analysis-visualization/analysis-filters/years-range/constants';

describe('Analysis table', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.loginWithFixtures();
    cy.visit('/analysis/table');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should load the table', () => {
    cy.wait(['@fetchIndicators', '@fetchImpactTable']).then(() => {
      cy.get('[data-testid="analysis-table"]').should('be.visible');
    });
  });

  it('user should be able to select year filters', () => {
    cy.wait('@h3Years').then((int) => {
      const years = int.response.body.data;
      // Check default filter values
      cy.wait('@fetchImpactTable').then((req) => {
        expect(req.request.query.startYear).to.eq(years[0].toString());
        expect(req.request.query.endYear).to.eq(
          (years[years.length - 1] + DEFAULT_END_YEAR_GAP).toString(),
        );
      });

      // Check 'from' options
      cy.get('[data-testid="years-range-btn"]').click();
      cy.get('[data-testid="select-year-selector-from"]').click();
      cy.get('[data-testid="year-selector-from-option"]').should('have.length', years.length);

      const fromYear = years[2];
      // Check if can select a typed value
      cy.get('[data-testid="select-year-selector-from"] input')
        .focus()
        .clear({ force: true })
        .type(`${fromYear}{enter}`, {
          force: true,
        })
        .should('have.value', fromYear);
      // Check if the payload request is correct
      cy.wait('@fetchImpactTable')
        .its('request.query.startYear')
        .should('eql', fromYear.toString());

      const toYear = years[0] + MAX_END_YEAR_RANGE;
      // Years dialog is already open
      cy.get('[data-testid="select-year-selector-to"]').click();

      // Check that the 'to' options years smaller than the selected 'from' year are disabled
      cy.get('[data-testid="year-selector-to-option"][aria-disabled="true"]').should(
        'have.length',
        3,
      );

      // Check if can select a typed value
      cy.get('[data-testid="select-year-selector-to"] input')
        .focus()
        .clear({ force: true })
        .type(`${toYear}`, {
          force: true,
          delay: 300,
        })
        .type('{enter}', { force: true })
        .should('have.value', toYear);
      // Check if the payload request is correct
      cy.wait('@fetchImpactTable').its('request.query.endYear').should('eql', toYear.toString());
    });
  });

  it('should sort actual data impact by year', () => {
    cy.wait('@fetchImpactTable');

    // Sort DESC
    cy.get('table th')
      .eq(3)
      .find('div>div>div:last')
      .as('lastYearColumnSortBtn')
      .click({ force: true });
    cy.wait('@fetchImpactTable').then((i) => {
      expect(i.request.query).haveOwnProperty('sortingYear');
      expect(i.request.query.sortingOrder).eq('DESC');
    });
    // Sort ASC
    cy.get('@lastYearColumnSortBtn').click({ force: true });
    cy.wait('@fetchImpactTable').then((i) => {
      expect(i.request.query).haveOwnProperty('sortingYear');
      expect(i.request.query.sortingOrder).eq('ASC');
    });
    // Remove sort
    cy.get('@lastYearColumnSortBtn').click({ force: true });
    cy.wait('@fetchImpactTable')
      .its('request.query')
      .should('not.include.any.keys', 'sortingYear', 'sortingOrder');
  });
});
