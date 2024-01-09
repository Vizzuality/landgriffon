describe('Download data template', () => {
  beforeEach(() => {
    cy.login();

    cy.intercept('GET', '/api/v1/sourcing-locations/materials*', {
      statusCode: 200,
      fixture: 'sourcing-locations/materials',
    }).as('sourcingLocationsMaterials');

    cy.intercept('GET', '/api/v1/sourcing-locations*', {
      statusCode: 200,
      fixture: 'sourcing-locations/index',
    }).as('sourcingLocations');
  });

  afterEach(() => {
    cy.logout();
  });

  it('clicking on Download template in the upload modal', () => {
    cy.intercept('/files/data-template.xlsx').as('downloadDataTemplate');

    cy.visit('/data');

    // Opening upload modal
    cy.get('[data-testid="upload-data-source-btn"]').click();
    cy.get('[data-testid="modal-upload-data-source"]').should('be.visible');

    cy.get('[data-testid="download-template-btn"]').should('have.attr', 'download');
    cy.get('[data-testid="download-template-btn"]')
      .should('have.attr', 'href')
      .and('equal', '/files/data-template.xlsx');
    cy.get('[data-testid="download-template-btn"]').click();

    cy.wait('@downloadDataTemplate').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });
});
