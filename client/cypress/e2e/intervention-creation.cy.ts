beforeEach(() => {
  cy.intercept('POST', '/api/v1/scenarios', {
    statusCode: 201,
    fixture: 'scenario/scenario-creation',
  }).as('scenarioCreation');

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

  cy.login();
  cy.createScenario();
  cy.visit('/data/scenarios/some-random-id/interventions/new');
});

describe('Intervention creation', () => {
  it('a user creates an intervetion – Switch to new material flow (successful creation)', () => {
    cy.intercept('POST', '/api/v1/scenario-interventions', {
      statusCode: 201,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfullInterventionCreation');

    cy.url().should('contains', '/interventions/new');

    // types title of the intervention
    cy.get('[data-testid="title-input"]').type('Lorem ipsum title');

    // selects a material
    cy.wait('@scenarioRawMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@scenarioYears');
    cy.get('[data-testid="startYear-select"]').click().find('input:visible').type('2017{enter}');
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

    // waits for material request and selects an option
    cy.wait('@scenarioNewMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    // waits for scenario location types request and selects an option
    cy.wait('@scenarioLocationTypes');
    cy.get('[data-testid="new-location-select"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    // waits for scenario location countries request and selects an option
    cy.wait('@scenarioLocationCountries');
    cy.get('[data-testid="new-location-country-select"]')
      .click()
      .find('input:visible')
      .type('Botswana{enter}');

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@successfullInterventionCreation').then(() => {
      // checks the toast message triggered after intervention creation
      cy.get('[data-testid="toast-message"]').should(
        'contain',
        'Intervention was created successfully',
      );
    });
  });

  it('a user creates an intervetion – Switch to new material flow (failed creation)', () => {
    cy.url().should('contains', '/interventions/new');
    cy.intercept('POST', '/api/v1/scenario-interventions', {
      statusCode: 400,
      fixture: 'intervention/failed-intervention-creation-dto',
    }).as('failedInterventionCreation');

    // types title of the intervention
    cy.get('[data-testid="title-input"]').type('Lorem ipsum title');

    // selects a material
    cy.wait('@scenarioRawMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@scenarioYears');
    cy.get('[data-testid="startYear-select"]').click().find('input:visible').type('2017{enter}');

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

    // waits for material request and selects an option
    cy.wait('@scenarioNewMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    // waits for scenario location types request and selects an option
    cy.wait('@scenarioLocationTypes');
    cy.get('[data-testid="new-location-select"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    // waits for scenario location countries request and selects an option
    cy.wait('@scenarioLocationCountries');
    cy.get('[data-testid="new-location-country-select"]')
      .click()
      .find('input:visible')
      .type('Botswana{enter}');

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@failedInterventionCreation').then(() => {
      // checks the toast message triggered informing something went wrong
      cy.get('[data-testid="toast-message"]').should(
        'contain',
        'Something went wrong during intervention creation',
      );
    });
  });
});
