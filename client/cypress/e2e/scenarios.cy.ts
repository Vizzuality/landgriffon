beforeEach(() => {
  cy.intercept('GET', '/api/v1/scenarios/**/interventions', {
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

    cy.wait('@fetchScenariosAfterDeletion');

    // ? check there are 9 scenarios available after deletion
    cy.get('[data-testid="scenario-card"]').should('have.length', 9);

    // ? checks the toast message triggered after deletion
    cy.get('[data-testid="toast-message"]').should('contain', 'Scenario deleted successfully');
  });

  it('a user sorts scenarios alphabetically', () => {
    // ? selects the "Sort by name" option and click on it
    cy.get('[data-testid="select-sort-scenario"]').click();
    cy.get('[role="listbox"]').type('{downArrow}').type('{enter}');

    // ? waits to give time to update the URL
    cy.wait(5);

    // ? checks the user updates acording to the sort selection
    cy.url().should('contain', 'sortBy=title');

    // ? checks the first scenario displayed contains is titled "BE_TESTS" which is,
    // ? according to our mockup, the first matchup alphabetically speaking
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'BE_TESTS');
  });

  it('a user sorts scenarios by most recent', () => {
    // ? selects the "Sort by most recent" option and click on it
    cy.get('[data-testid="select-sort-scenario"]').click();
    cy.get('[role="listbox"]').type('{downArrow}').type('{upArrow}').type('{enter}');

    // ? waits to give time to update the URL
    cy.wait(100);

    // ? checks the user updates acording to the sort selection
    cy.url().should('contain', 'sortBy=-updatedAt');

    // ? checks the first scenario displayed contains is titled "Test: Change Rubber Location Cambodia" which is,
    // ? according to our mockup, the most recent scenario updated
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'Test: Change Rubber Location Cambodia');
  });

  it('after setting a sort option, refreshing the page keeps the option set', () => {
    // ? selects the "Sort by name" option and click it
    cy.get(`[data-testid="select-sort-scenario"]`).click();
    cy.get('[role="listbox"]').type('{downArrow}').type('{enter}');

    // ? waits to give time to update the URL
    cy.wait(5);

    // ? checks the user updates acording to the sort selection
    cy.url().should('contain', 'sortBy=title');

    // ? reloads the page
    cy.reload();

    // ? checks the selector is set according to the URL params
    cy.get(`[data-testid="select-sort-scenario"]`)
      .find('button')
      .should('have.text', 'Sort by name');

    // ? checks the first scenario displayed contains is titled "BE_TESTS" which is,
    // ? according to our mockup, the first matchup alphabetically speaking
    cy.get('[data-testid="scenario-card"]')
      .first()
      .find('[data-testid="scenario-title"]')
      .should('have.text', 'BE_TESTS');
  });
});
