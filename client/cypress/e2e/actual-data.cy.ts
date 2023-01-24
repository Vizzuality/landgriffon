describe('Actual data', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/data');
  });

  afterEach(() => {
    cy.logout();
  });

  it('admin should be able to upload data source', () => {
    cy.intercept('/api/v1/users/me', { fixture: 'profile/admin.json' }).as('profile').as('profile');
    cy.get('[data-testid=upload-data-source-btn]').should('not.be.disabled');
  });

  it('user should not be able to upload data source', () => {
    cy.intercept('/api/v1/users/me', { fixture: 'profile/user.json' });
    cy.get('[data-testid=upload-data-source-btn]').should('be.disabled');
  });
});
