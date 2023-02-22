beforeEach(() => {
  cy.interceptAllRequests();

  cy.login();
  cy.visit('/data/scenarios/some-random-id/interventions/random-intervention-id/edit');
});

afterEach(() => {
  cy.logout();
});

describe('Intervention edition', () => {
  it('a user creates an intervetion – Switch to Change production efficiency', () => {
    cy.url().should('contains', '/interventions/random-intervention-id/edit');
  });
});
