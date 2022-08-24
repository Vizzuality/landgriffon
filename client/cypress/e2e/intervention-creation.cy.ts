beforeEach(() => {
  cy.intercept('POST', '/api/v1/scenarios', {
    statusCode: 201,
    fixture: 'scenario/scenario-creation',
  }).as('scenarioCreation');

  cy.intercept('POST', '/api/v1/scenario-interventions', {
    statusCode: 201,
    fixture: 'intervention-creation',
  }).as('interventionCreation');

  cy.intercept('GET', '/api/v1/sourcing-records/years', {
    statusCode: 200,
    fixture: 'scenario/scenario-years',
  }).as('scenarioYears');

  cy.intercept('GET', '/api/v1/materials/trees?depth=1', {
    statusCode: 200,
    fixture: 'scenario/scenario-materials',
  }).as('scenarioNewMaterials');

  cy.intercept('GET', '/api/v1/materials/trees?depth=1&withSourcingLocations=true', {
    statusCode: 200,
    fixture: 'scenario/scenario-raw-materials',
  }).as('scenarioRawMaterials');

  cy.intercept('GET', '/api/v1/sourcing-locations/location-types', {
    statusCode: 200,
    fixture: 'scenario/scenario-location-types',
  }).as('scenarioLocationTypes');

  cy.intercept('GET', '/api/v1/admin-regions/trees?depth=0', {
    statusCode: 200,
    fixture: 'scenario/scenario-location-countries',
  }).as('scenarioLocationCountries');

  cy.createScenario();
  cy.visit('/admin/scenarios/some-random-id/interventions/new');
});

afterEach(() => {
  cy.logout();
});

describe('Intervention creation', () => {
  it('a user creates an intervetion – Switch to new material flow', () => {
    cy.url().should('contains', '/interventions/new');

    // selects a material
    cy.wait('@scenarioRawMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@scenarioYears').then(() => {
      const $inputSelect = cy.get('[data-testid="startYear-select"]');
      $inputSelect.click();
      $inputSelect.find('input:not(.hidden)').type('2017{enter}');
    });

    // selects the first intervention type: Switch to new material
    cy.get('[data-testid="intervention-type-option"]').first().click();

    // check selectors are visible according to the intervention type selected
    cy.get('[data-testid="new-material-select"]').should('be.visible');
    cy.get('[data-testid="new-location-select"]').should('be.visible');
    cy.get('[data-testid="new-location-country-select"]').should('be.visible');

    // supplier options should not be visible by default
    cy.get('[data-testid="new-t1-supplier-select"]').should('have.length', 0);
    cy.get('[data-testid="new-producer-select"]').should('have.length', 0);

    // coefficients should not be visible by default
    cy.get('[data-testid="GHG_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="DF_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="UWU_T-input"]').should('have.length', 0);
    cy.get('[data-testid="BL_LUC_T-input-input"]').should('have.length', 0);

    cy.wait('@scenarioNewMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    cy.wait('@scenarioLocationTypes').then(() => {
      const $inputSelect = cy.get('[data-testid="new-location-select"]');
      $inputSelect.click();
      $inputSelect.find('input:not(.hidden)').type('Country of production{enter}');
    });

    cy.wait('@scenarioLocationCountries').then(() => {
      const $inputSelect = cy.get('[data-testid="new-location-country-select"]');
      $inputSelect.click();
      $inputSelect.find('input:not(.hidden)').type('Botswana{enter}');
    });

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@interventionCreation').then((interception) => {
      const {
        response: { statusCode, body },
      } = interception;

      expect(statusCode).to.equal(201);
      expect(body.data.id).to.equal('random-intervention-id');

      // checks the toast message triggered after intervention creation
      cy.get('.test-toast-message')
        .find('[role="status"]')
        .should('contain', 'Intervention was created successfully');
    });
  });
});
