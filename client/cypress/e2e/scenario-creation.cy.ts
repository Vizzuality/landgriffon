before(() => {
  cy.login();
  cy.visit('/admin/scenarios/new');
});

after(() => {
  cy.logout();
});

// describe('Scenario creation', () => {
//   it('should allow create new scenarios and come back', () => {
//     cy.get('[data-testid="scenario-add-button"]').should('have.text', 'Add scenario').click();

//     cy.url().should('contain', '/admin/scenarios/new');

//     cy.get('[data-testid="scenario-back-button"]')
//       .click()
//       .url()
//       .should('contain', '/admin/scenarios');
//   });
// });
