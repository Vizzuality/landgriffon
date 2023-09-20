describe('Forgot password', () => {
  afterEach(() => {
    cy.logout();
  });

  it('request recover password', () => {
    cy.intercept('POST', '/api/v1/users/me/password/recover', {
      statusCode: 201,
      body: {},
    }).as('recoverPasswordRequest');

    cy.visit('/auth/forgot-password');
    // Input the email
    cy.get('[name="email"]').type(Cypress.env('USERNAME'));
    cy.get('button[type="submit"]').click();

    // Show success message
    cy.wait('@recoverPasswordRequest').then(() => {
      cy.get('h2').should('have.text', 'Check your email');
    });
  });

  it('reset password', () => {
    const fakeToken = 'nyancat';

    cy.intercept('POST', '/api/v1/users/me/password/reset', {
      statusCode: 201,
      fixture: 'auth/me.json',
    }).as('resetPasswordRequest');

    cy.intercept('GET', '/api/auth/session', {
      fixture: 'auth/session.json',
    }).as('session');

    cy.intercept('GET', '/api/v1/users/me', {
      fixture: 'auth/me.json',
    });

    cy.visit(`/auth/reset-password/${fakeToken}`);

    // Input the new password
    cy.get('[name="password"]').type(Cypress.env('PASSWORD'));
    cy.get('[name="passwordConfirmation"]').type(Cypress.env('PASSWORD'));
    cy.get('button[type="submit"]').click();

    // Redirect to the map once the password is reset
    cy.wait(['@resetPasswordRequest', '@session']);
  });
});
