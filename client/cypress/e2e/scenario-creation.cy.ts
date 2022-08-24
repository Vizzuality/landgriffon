beforeEach(() => {
  cy.login().visit('/admin/scenarios/new');

  cy.intercept('POST', '/api/v1/scenarios', {
    statusCode: 201,
    fixture: 'scenario/scenario-creation',
  }).as('scenarioCreation');
});

afterEach(() => {
  cy.logout();
});

describe('Scenario creation', () => {
  it('a user populates all fields and creates a scenario successfully', () => {
    cy.url().should('contain', '/admin/scenarios/new');
    cy.get('[data-testid="scenario-name-input"]').type('scenario mockup name');
    cy.get('[data-testid="scenario-description-input"]').type('scenario mockup description');
    cy.get('[data-testid="create-scenario-button"]').click();

    cy.wait('@scenarioCreation').then((interception) => {
      const {
        response: { statusCode, body },
      } = interception;

      expect(statusCode).to.equal(201);
      expect(body.data.id).to.equal('some-random-id');

      // checks the toast message triggered after scenario creation
      cy.get('.test-toast-message')
        .find('[role="status"]')
        .should('contain', 'The scenario scenario mockup name has been created');
    });
  });

  it('a user tries to create a scenario without filling in the name field and a hint appears below the field', () => {
    cy.url().should('contain', '/admin/scenarios/new');
    cy.get('[data-testid="create-scenario-button"]').click();

    cy.get('[data-testid="hint-input-title"]')
      .contains('title must be at least 2 characters')
      .should('be.visible');
  });

  it('a user types an invalid name and a hint appears below the field', () => {
    cy.url().should('contain', '/admin/scenarios/new');
    cy.get('[data-testid="scenario-name-input"]').type('?');
    cy.get('[data-testid="create-scenario-button"]').click();

    cy.get('[data-testid="hint-input-title"]')
      .contains('title must be at least 2 characters')
      .should('be.visible');
  });
});
