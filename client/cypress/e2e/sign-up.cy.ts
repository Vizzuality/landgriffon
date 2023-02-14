describe('Sign up', () => {
  beforeEach(() => {
    cy.intercept('POST', '/auth/sign-up', {
      statusCode: 201,
      fixture: 'auth/sign-up',
    }).as('signUpRequest');

    cy.visit('/auth/signup');
  });

  it('A user is able to sign up for the platform', () => {
    cy.fixture('auth/sign-up').then((signUpPayload) => {
      // * full fills signup form
      cy.get('[data-testid="lname-input"]').type(signUpPayload.fname);
      cy.get('[data-testid="fname-input"]').type(signUpPayload.lname);
      cy.get('[data-testid="email-input"]').type(signUpPayload.email);
      cy.get('[data-testid="password-input"]').type(signUpPayload.password);
      cy.get('[data-testid="confirm-password-input"]').type(signUpPayload.password);
      cy.get('[data-testid="sign-up-submit-btn"]').click();

      // * waits for the request and confirms toast message. Then, we confirm the user has been redirected to /auth/signin page
      cy.wait('@signUpRequest').its('response.statusCode').should('eq', 201);
      cy.get('[data-testid="toast-message"]').should('contain', 'Account created successfully');
      cy.url().should('contain', '/auth/signin');
    });
  });
});
