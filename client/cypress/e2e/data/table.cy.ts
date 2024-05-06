describe('Data ingestion: table visualization', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/sourcing-locations/materials*', {
      fixture: 'sourcing-locations/materials',
    }).as('sourcingLocationsMaterials');
    cy.login();
    cy.visit('/data');
  });

  afterEach(() => {
    cy.logout();
  });

  it('see data ingested in a table', () => {
    cy.wait('@sourcingLocationsMaterials').then((interception) => {
      cy.get('table').should('be.visible');
      const { meta } = interception.response?.body || {};

      cy.get('tr.group').should(
        'have.length',
        meta?.size > meta?.totalItems ? meta?.totalItems : meta?.size,
      );
    });
  });

  it('no filters in the table', () => {
    cy.get('[data-testid="search-name-scenario"]').should('be.disabled');
  });
});
