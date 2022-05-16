describe('Selector', () => {
  // setup: open the more filters popover
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.dataCy('navigate-table').click();
    cy.dataCy('open-more-filters').click();
  });

  it('Selector opens on click', () => {
    cy.dataCy('materials-select-button').click();
    cy.dataCy('materials-select-content').should('be.visible');
  });

  it('Selector closes on button click', () => {
    cy.dataCy('materials-select-button').click();
    cy.dataCy('materials-select-content').should('be.visible');
    cy.dataCy('materials-select-button').click();
    cy.dataCy('materials-select-content').should('not.exist');
  });

  it('Selector changes value on click', () => {
    cy.dataCy('materials-select-button').should('contain.text', 'Materials');
    cy.dataCy('materials-select-button').click();
    cy.dataCy('tree-node').first().click();
    cy.dataCy('tree-node')
      .first()
      .find('.rc-tree-title')
      .then((node) => {
        cy.dataCy('materials-select-button').should('not.contain.text', 'Materials');
        cy.dataCy('materials-select-button').click();
        // value keeps checked after closing the select
        cy.dataCy('materials-select-button').should('not.contain.text', 'Materials');
        cy.dataCy('materials-select-button').should('contain.text', node.text());
      });
  });
});
