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

  cy.intercept('GET', '/api/v1/scenario-interventions/random-intervention-id?*', {
    statusCode: 200,
    fixture: 'intervention/intervention-creation-dto',
  }).as('fetchIntervention');

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

  cy.login();
  cy.visit('/data/scenarios/some-random-id/interventions/random-intervention-id/edit');
});

afterEach(() => {
  cy.logout();
});

describe('Intervention edition', () => {
  it('a user creates an intervetion – Switch to Change production efficiency', () => {
    cy.intercept('PATCH', '/api/v1/scenario-interventions/random-intervention-id', {
      statusCode: 200,
      fixture: 'intervention/intervention-creation-dto',
    }).as('successfulInterventionEdition');

    cy.url().should('contains', '/interventions/random-intervention-id/edit');
  });
});
