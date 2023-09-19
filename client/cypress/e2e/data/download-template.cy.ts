describe('Download data template', () => {
  beforeEach(() => {
    cy.login();
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
