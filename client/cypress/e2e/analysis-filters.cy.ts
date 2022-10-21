describe('Analysis and filters', () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
    cy.login();
  });

  it('should be able to select and indicator', () => {
    // data integrity check
    cy.intercept('GET', '/api/v1/**/indicators').as('indicators');
    cy.visit('/analysis/table');
    cy.wait('@indicators').then((interception) => {
      expect(interception.response.body.data).have.length(4);
    });

    // select indicator
    cy.get('#indicators-selector').click().type('{arrowDown}{enter}');
  });
});
