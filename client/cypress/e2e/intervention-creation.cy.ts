beforeEach(() => {
  cy.interceptAllRequests();

  cy.intercept('GET', '/api/v1/admin-regions/trees*', {
    statusCode: 200,
    fixture: 'scenario/scenario-location-countries',
  }).as('originsTrees');

  cy.intercept('GET', '/api/v1/materials/trees?depth=1', {
    statusCode: 200,
    fixture: 'scenario/scenario-materials',
  }).as('materialsTrees');

  cy.login();
  cy.createScenario();
  cy.visit('/data/scenarios/some-random-id/interventions/new');
});

afterEach(() => {
  cy.logout();
});

describe('Intervention creation', () => {
  it('a user creates an intervention – Switch to new material flow (successful creation)', () => {
    cy.intercept('POST', '/api/v1/interventions', {
      statusCode: 201,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfullyInterventionCreation');

    cy.url().should('contains', '/interventions/new');

    // types title of the intervention
    cy.get('[data-testid="title-input"]').type('Lorem ipsum title');

    // selects a material
    cy.wait('@materialsTrees').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@sourcingRecordYears');
    cy.get('[data-testid="select-startYear"]').type(
      '{enter}{downArrow}{downArrow}{downArrow}{downArrow}{enter}',
    );

    // selects the first intervention type: Switch to new material
    cy.get('[data-testid="intervention-type-option"]').first().click({ timeout: 500 });

    // check selectors are visible according to the intervention type selected
    cy.get('[data-testid="new-material-select"]').should('have.length', 1);
    cy.get('[data-testid="select-newLocationType"]').should('have.length', 1);
    cy.get('[data-testid="select-newLocationCountryInput"]').should('have.length', 1);

    // supplier options should not be visible by default
    cy.get('[data-testid="new-t1-supplier-select"]').should('have.length', 0);
    cy.get('[data-testid="new-producer-select"]').should('have.length', 0);

    // coefficients should not be visible by default
    cy.get('[data-testid="GHG_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="DF_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="UWU_T-input"]').should('have.length', 0);
    cy.get('[data-testid="BL_LUC_T-input-input"]').should('have.length', 0);

    // waits for material request and selects an option
    cy.wait('@materialsTrees').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    // checking volume field is disabled
    cy.get('[data-testid="volume-input"]').should('be.disabled');

    // waits for scenario location types request and selects an option
    cy.wait('@supportedLocationTypes');
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    // waits for scenario location countries request and selects an option
    cy.wait('@originsTrees');
    cy.get('[data-testid="select-newLocationCountryInput"]')
      .click()
      .find('input:visible')
      .type('Botswana{enter}');

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@successfullyInterventionCreation').then(() => {
      // checks the toast message triggered after intervention creation
      cy.get('[data-testid="toast-message"]').should(
        'contain',
        'Intervention was created successfully',
      );
    });
  });

  it('a user creates an intervetion – Switch to new material flow (failed creation)', () => {
    cy.url().should('contains', '/interventions/new');
    cy.intercept('POST', '/api/v1/interventions', {
      statusCode: 400,
      fixture: 'intervention/failed-intervention-creation-dto',
    }).as('failedInterventionCreation');

    // types title of the intervention
    cy.get('[data-testid="title-input"]').type('Lorem ipsum title');

    // selects a material
    cy.wait('@materialsTrees').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@sourcingRecordYears');
    cy.get('[data-testid="select-startYear"]').type(
      '{enter}{downArrow}{downArrow}{downArrow}{downArrow}{enter}',
    );

    // selects the first intervention type: Switch to new material
    cy.get('[data-testid="intervention-type-option"]').first().click({ timeout: 500 });

    // check selectors are visible according to the intervention type selected
    cy.get('[data-testid="new-material-select"]').should('have.length', 1);
    cy.get('[data-testid="select-newLocationType"]').should('have.length', 1);
    cy.get('[data-testid="select-newLocationCountryInput"]').should('have.length', 1);

    // supplier options should not be visible by default
    cy.get('[data-testid="new-t1-supplier-select"]').should('have.length', 0);
    cy.get('[data-testid="new-producer-select"]').should('have.length', 0);

    // coefficients should not be visible by default
    cy.get('[data-testid="GHG_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="DF_LUC_T-input"]').should('have.length', 0);
    cy.get('[data-testid="UWU_T-input"]').should('have.length', 0);
    cy.get('[data-testid="BL_LUC_T-input-input"]').should('have.length', 0);

    // waits for material request and selects an option
    cy.wait('@materialsTrees').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    // waits for scenario location types request and selects an option
    cy.wait('@supportedLocationTypes');
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    // waits for scenario location countries request and selects an option
    cy.wait('@originsTrees');
    cy.get('[data-testid="select-newLocationCountryInput"]')
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

  it('a user skips selecting type of intervention and a hint appears', () => {
    // if the user skips full filling any field in the form, a hint should appear below the types of interventions available
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-interventionType"]').should('have.length', 1);
    // after clicking on the first type of intervention, the previous hint should be gone
    cy.get('[data-testid="intervention-type-option"]').first().click();
    cy.get('[data-testid="hint-input-interventionType"]').should('have.length', 0);
  });
});

describe('Intervention location type', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/interventions', {
      statusCode: 201,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfullInterventionCreation');

    cy.wait('@supportedLocationTypes');

    // Choose a location type: Switch to new material
    cy.get('[data-testid="intervention-type-option"]').first().click();

    cy.wait(3000);
  });

  it('country of production => city, address, coordinates is not required', () => {
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    cy.get('[data-testid="city-address-coordinates-field"]').should('not.exist');
  });

  it('aggregation point => city, address, coordinates is required', () => {
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Production aggregation{enter}');

    const cityAddressCoordinateField = cy
      .get('[data-testid="city-address-coordinates-field"]')
      .should('exist');
    const cityAddressCoordinateInput = cityAddressCoordinateField.find('input');

    // When is a city or address
    cityAddressCoordinateInput.type('Hogwarts');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]').should('not.exist');

    // When is empty
    cityAddressCoordinateInput.clear();
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]')
      .find('p')
      .should('contain.text', 'City, address or coordinates is required');

    // When is a coordinate
    cityAddressCoordinateInput.clear().type('40, -3');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]').should('not.exist');

    // When is not valid coordinate
    cityAddressCoordinateInput.clear().type('200, -3');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]')
      .find('p')
      .should('contain.text', 'Coordinates should be valid (-90/90, -180/180)');
  });

  it('point of production => city, address, coordinates is required', () => {
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Point of production{enter}');

    const cityAddressCoordinateField = cy.get('[data-testid="city-address-coordinates-field"]');
    const cityAddressCoordinateInput = cityAddressCoordinateField.find('input');

    // When is a city or address
    cityAddressCoordinateInput.type('Hogwarts');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]').should('not.exist');

    // When is empty
    cityAddressCoordinateInput.clear();
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]')
      .find('p')
      .should('contain.text', 'City, address or coordinates is required');

    // When is a coordinate
    cityAddressCoordinateInput.clear().type('40, -3');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]').should('not.exist');

    // When is not valid coordinate
    cy.get('[data-testid="city-address-coordinates-field"]').find('input').clear().type('200, -3');
    cy.get('[data-testid="intervention-submit-btn"]').click();
    cy.get('[data-testid="hint-input-cityAddressCoordinates"]')
      .find('p')
      .should('contain.text', 'Coordinates should be valid (-90/90, -180/180)');
  });

  it('unknown => city, address, coordinates is not required', () => {
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Unknown{enter}');

    cy.get('[data-testid="city-address-coordinates-field"]').should('not.exist');
  });
});

describe('Intervention creation: Change production efficiency', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/interventions', {
      statusCode: 201,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfullyInterventionCreation');

    cy.url().should('contains', '/interventions/new');

    // types title of the intervention
    cy.get('[data-testid="title-input"]').type('Lorem ipsum title');

    // selects a material
    cy.wait('@materialsTrees').then(() => {
      const $inputSelect = cy.get('[data-testid="materials-select"]');
      $inputSelect.click();

      $inputSelect.find('.rc-tree-list').contains('Cotton').click();
    });

    // selects a year
    cy.wait('@sourcingRecordYears');
    cy.get('[data-testid="select-startYear"]').type(
      '{enter}{downArrow}{downArrow}{downArrow}{downArrow}{enter}',
    );
  });

  // By default the intervention is created with zero coefficients
  it('a user should be able to create an intervention with zero coefficients', () => {
    cy.get('[data-testid="intervention-type-option"]').last().click();
    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@successfullyInterventionCreation').then((interception) => {
      const { body } = interception.request;
      const { newIndicatorCoefficients } = body;
      Object.keys(newIndicatorCoefficients).forEach((key) => {
        expect(newIndicatorCoefficients[key]).equal(0);
      });
    });
  });

  it('a user should not be able to create an intervention with empty coefficients', () => {
    cy.get('[data-testid="intervention-type-option"]').last().click();

    cy.get('[data-testid="fieldset-impacts-per-ton"]')
      .find('input:enabled')
      .each(($input) => {
        cy.wrap($input).clear();
      });

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.get('[data-testid="fieldset-impacts-per-ton"]')
      .find('input:enabled')
      .each(($input) => {
        cy.get(`[data-testid="hint-input-${$input.attr('name')}"]`).should('exist');
      });
  });

  it('a user should be able to create an intervention with edited coefficient', () => {
    cy.get('[data-testid="intervention-type-option"]').last().click();

    cy.get('[data-testid="fieldset-impacts-per-ton"]')
      .find('input:enabled')
      .each(($input) => {
        cy.wrap($input).type('100');
      });

    // submits intervention
    cy.get('[data-testid="intervention-submit-btn"]').click();

    cy.wait('@successfullyInterventionCreation').then((interception) => {
      const { body } = interception.request;
      const { newIndicatorCoefficients } = body;
      Object.keys(newIndicatorCoefficients).forEach((key) => {
        expect(newIndicatorCoefficients[key]).equal(100);
      });
    });
  });
});
