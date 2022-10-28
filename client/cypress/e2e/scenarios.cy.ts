beforeEach(() => {
  cy.intercept('GET', '/api/v1/scenarios/**/interventions*', {
    statusCode: 200,
    fixture: 'scenario/scenario-interventions',
  });

  cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
    statusCode: 200,
    fixture: 'scenario/scenarios',
  });

  cy.intercept('DELETE', '/api/v1/scenarios/**', {
    statusCode: 200,
  });

  cy.login();
  cy.visit('/data/scenarios');
});

afterEach(() => {
  cy.logout();
});

describe('Scenarios', () => {
  it('should be able to see the scenarios page', () => {
    cy.url().should('contain', '/data/scenarios');
    cy.get('h1').should('have.text', 'Manage scenarios data');
    cy.log('Scenarios is selected in the menu bar');
    cy.get('[data-testisactive="true"]').should('have.text', 'Scenarios');
  });

  it('should show same scenarios cards length than API', () => {
    cy.get('[data-testid="scenario-card"]').should('have.length', 10);
  });

  it('should every scenario have interventions', () => {
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-interventions-item"]')
      .should('have.length', 2);
  });

  it('should allow create new scenarios and come back', () => {
    cy.get('[data-testid="scenario-add-button"]').should('have.text', 'Add scenario').click();

    cy.url().should('contain', '/data/scenarios/new');

    cy.get('[data-testid="scenario-back-button"]')
      .click()
      .url()
      .should('contain', '/data/scenarios');
  });

  it('a user removes a scenario succesfully', () => {
    // ? check there are, initially, 10 scenarios available before deletion
    cy.get('[data-testid="scenario-card"]').should('have.length', 10);

    // ? clicks on "Delete" button of the first card available
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-delete-btn"]')
      .click();

    // ? intercepts again the same request to retrieve one scenarios less
    cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
      statusCode: 200,
      fixture: 'scenario/scenarios-delete',
    }).as('fetchScenariosAfterDeletion');

    // ? In the dialog: clicks on "Delete" button
    cy.get('[data-testid="dialog-delete-confirmation-btn"').click();

    // cy.wait('@fetchScenariosAfterDeletion');

    // ? check there are 9 scenarios available after deletion
    cy.get('[data-testid="scenario-card"]').should('have.length', 9);

    // ? checks the toast message triggered after deletion
    cy.get('[data-testid="toast-message"]').should('contain', 'Scenario deleted successfully');
  });

  it('a user sorts scenarios alphabetically', () => {
    cy.intercept('GET', '/api/v1/scenarios?sort=title&disablePagination=true', {
      statusCode: 200,
      fixture: 'scenario/filters/by-name-results',
    });

    // ? selects the "Sort by name" option and click on it
    cy.get('[data-testid="select-sort-scenario"]').click();
    cy.get('[role="listbox"]').type('{downArrow}').type('{enter}');

    // ? checks the user updates acording to the sort selection
    cy.url().should('contain', 'sortBy=title');

    cy.get('[data-testid="scenario-card"]').should('have.length', 10);

    // ? checks the first scenario displayed contains is titled "Scenario A" which is,
    // ? according to the mockup, the first matchup alphabetically speaking
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Scenario A');
  });

  it('a user sorts scenarios by most recent', () => {
    cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
      statusCode: 200,
      fixture: 'scenario/filters/most-recent-results',
    });

    // ? selects the "Sort by most recent" option and click on it
    cy.get('[data-testid="select-sort-scenario"]').click();
    cy.get('[role="listbox"]').type('{downArrow}').type('{upArrow}').type('{enter}');

    // ? checks the user updates acording to the sort selection
    cy.url().should('contain', 'sortBy=-updatedAt');

    cy.get('[data-testid="scenario-card"]').should('have.length', 10);

    // ? checks the first scenario displayed contains is titled "Test: Change Rubber Location Cambodia" which is,
    // ? according to the mockup, the most recent scenario updated
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Test: Change Rubber Location Cambodia');
  });

  it('after setting a sort option, refreshing the page keeps the option set', () => {
    cy.intercept('GET', '/api/v1/scenarios?sort=-updatedAt&disablePagination=true', {
      statusCode: 200,
      fixture: 'scenario/filters/most-recent-results',
    });

    // ? visits the scenario index with a sorting filter already applied
    cy.visit('/data/scenarios?sortBy=-updatedAt');

    // ? checks the selector is set according to the URL params
    cy.get('[data-testid="select-sort-scenario"]')
      .find('button')
      .should('have.text', 'Sort by most recent');

    // ? checks the first scenario displayed contains is titled "Test: Change Rubber Location Cambodia" which is,
    // ? according to the mockup, the most recent scenario updated
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Test: Change Rubber Location Cambodia');
  });

  it('a user looks up scenario using the search', () => {
    cy.intercept(
      'GET',
      '/api/v1/scenarios?sort=-updatedAt&disablePagination=true&search[title]=interventions',
      {
        statusCode: 200,
        fixture: 'scenario/filters/search-results',
      },
    );

    // ? types "intervention" in the search filter
    cy.get('[data-testid="search-name-scenario"]').type('interventions');

    // ? the URL should update according to what was written in the search filter
    cy.url().should('contain', 'search=interventions');

    // ? checks there are 5 scenarios matching the query, according to the mockup
    cy.get('[data-testid="scenario-card"]').should('have.length', 5);

    // ? checks the first scenario contains the title "Scenario with interventions", according to the mockup
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Scenario with interventions');
  });

  it('reloading the page with the search query param should filter the list automatically', () => {
    cy.intercept(
      'GET',
      '/api/v1/scenarios?sort=-updatedAt&disablePagination=true&search[title]=interventions',
      {
        statusCode: 200,
        fixture: 'scenario/filters/search-results',
      },
    );

    // ? visits the scenario index with a sorting filter already applied
    cy.visit('/data/scenarios?search=interventions');

    // ? checks the search filter is populated automatically with the value coming from URL params
    cy.get('[data-testid="search-name-scenario"]').should('have.value', 'interventions');

    // ? checks there are 5 scenarios matching the query, according to the mockup
    cy.get('[data-testid="scenario-card"]').should('have.length', 5);

    // ? checks the first scenario contains the title "Scenario with interventions", according to the mockup
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Scenario with interventions');
  });
});
