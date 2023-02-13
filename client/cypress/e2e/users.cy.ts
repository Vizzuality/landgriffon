afterEach(() => {
  cy.logout();
});

describe('Users page for admins', () => {
  before(() => {
    cy.intercept('api/v1/users?page[size]=50&page[number]=1', { fixture: 'users/paginated' });
    cy.intercept('api/v1/users/me', { fixture: 'profiles/admin' }).as('profile');
    cy.login();
  });

  it('an admin user should be able to click the Users tab', () => {
    cy.visit('/profile');
    cy.get('a[data-testname="admin-menu-item-Users"]').should('exist').click();
    cy.url().should('contain', 'profile/users');
    cy.get('[data-testname="user-table-row"]').should('have.length', 18);
  });

  it('an admin user should be able to see the Users table data', () => {
    cy.visit('/profile/users');
  });
});

describe('Users page for NO admin user', () => {
  before(() => {
    cy.intercept('api/v1/users?page[size]=50&page[number]=1', { fixture: 'users/paginated' });
    cy.intercept('api/v1/users/me', { fixture: 'profiles/all-permissions' }).as('profile');
    cy.login();
  });

  it('an no admin user should not be able to click the Users tab', () => {
    cy.visit('/profile');
    cy.get('span[data-testname="admin-menu-item-Users"]').should('exist');
  });

  it('an no admin user should not be able to see the Users table data', () => {
    cy.visit('/profile/users');
    cy.get('[data-testname="user-table-row"]').should('have.length', 0);
  });
});
