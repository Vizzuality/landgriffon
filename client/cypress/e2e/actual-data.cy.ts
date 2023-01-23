describe('Actual data', () => {
  afterEach(() => {
    cy.logout();
  });

  it('admin should be able to upload data source', () => {
    cy.login();
    cy.visit('/data');
    cy.get('[data-testid=upload-data-source-btn]').should('not.be.disabled');
  });

  it('user should not be able to upload data source', () => {
    cy.loginAsUser();
    cy.visit('/data');
    cy.get('[data-testid=upload-data-source-btn]').should('be.disabled');
  });
});
