describe('Profile', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it('change password', () => {
    cy.intercept('PATCH', '/api/v1/users/me/password', {
      statusCode: 200,
      body: {},
    }).as('updatePasswordRequest');
    cy.visit('/profile');

    cy.get('[name="currentPassword"]').type(Cypress.env('PASSWORD'));
    cy.get('[name="newPassword"]').type(Cypress.env('PASSWORD'));
    cy.get('[name="passwordConfirmation"]').type(Cypress.env('PASSWORD'));
    cy.get('button[data-testid="submit-update-password"]').click();
  });
});
