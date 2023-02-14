beforeEach(() => {
  cy.intercept('GET', '/api/v1/indicators*', {
    fixture: 'indicators/index',
  }).as('fetchIndicators');

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

  cy.intercept('GET', '/api/v1/business-units/trees?depth=1*', {
    statusCode: 200,
    fixture: 'trees/business-units',
  }).as('businessUnits');

  cy.intercept('GET', '/api/v1/suppliers/trees*', {
    statusCode: 200,
    fixture: 'trees/suppliers',
  });

  cy.intercept(
    {
      method: 'GET',
      pathname: '/api/v1/suppliers/types',
      query: {
        type: 't1supplier',
      },
    },
    {
      statusCode: 200,
      fixture: 'suppliers/types-t1supplier',
    },
  );

  cy.intercept(
    {
      method: 'GET',
      pathname: '/api/v1/suppliers/types',
      query: {
        type: 'producer',
      },
    },
    {
      statusCode: 200,
      fixture: 'suppliers/types-producer',
    },
  );

  cy.intercept('GET', '/api/v1/materials/trees?depth=1&withSourcingLocations=true*', {
    statusCode: 200,
    fixture: 'trees/materials',
  }).as('scenarioRawMaterials');

  cy.intercept('GET', '/api/v1/sourcing-locations/location-types/supported', {
    statusCode: 200,
    fixture: 'location-types/index',
  }).as('scenarioLocationTypes');

  cy.intercept('GET', '/api/v1/admin-regions/trees*', {
    statusCode: 200,
    fixture: 'scenario/scenario-location-countries',
  }).as('scenarioLocationCountries');

  cy.login();
  cy.createScenario();
  cy.visit('/data/scenarios/some-random-id/interventions/new');
});

afterEach(() => {
  cy.logout();
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
    cy.wait('@scenarioNewMaterials').then(() => {
      const $inputSelect = cy.get('[data-testid="new-material-select"]');
      $inputSelect.click();
      $inputSelect.find('.rc-tree-list').contains('Fruits, berries and nuts').click();
    });

    // checking volume field is disabled
    cy.get('[data-testid="volume-input"]').should('be.disabled');

    // waits for scenario location types request and selects an option
    cy.wait('@scenarioLocationTypes');
    cy.get('[data-testid="select-newLocationType"]')
      .click()
      .find('input:visible')
      .type('Country of production{enter}');

    // waits for scenario location countries request and selects an option
    cy.wait('@scenarioLocationCountries');
    cy.get('[data-testid="select-newLocationCountryInput"]')
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
});

describe('Intervention location type', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/scenario-interventions', {
      statusCode: 201,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfullInterventionCreation');

    cy.wait('@scenarioLocationTypes');

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
