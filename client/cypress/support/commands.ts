import { signIn, signOut } from 'next-auth/react';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add(
  'login',
  ({
    username = Cypress.env('USERNAME'),
    password = Cypress.env('PASSWORD'),
  } = {}): Cypress.Chainable => {
    cy.log('🔐 Sign in with Next Auth');

    cy.intercept('GET', '/api/auth/session', {
      fixture: 'auth/session.json',
    }).as('session');

    cy.intercept('GET', '/api/v1/users/me', {
      fixture: 'auth/me.json',
    });

    return cy.session(['login', username, password], () => {
      cy.wrap(
        signIn('credentials', {
          redirect: false,
          username,
          password,
        }),
      );
    });
  },
);

Cypress.Commands.add('createScenario', (): void => {
  cy.log('Creates a scenario');

  cy.visit('/data/scenarios/new');
  cy.get('[data-testid="scenario-name-input"]').type('scenario mockup name');
  cy.get('[data-testid="scenario-description-input"]').type('scenario mockup description');
  // cy.get('[data-testid="scenario-form-validation-true"]').should('exist'); // wait for the validation
  cy.get('[data-testid="create-scenario-button"]').should('not.be.disabled').click();
});

Cypress.Commands.add('logout', (): Cypress.Chainable => {
  cy.log('logout');

  return cy.wrap(signOut({ redirect: false }));
});

Cypress.Commands.add('interceptAllRequests', (): void => {
  cy.log('Intercepting requests');

  // Indicators requests
  cy.intercept('GET', '/api/v1/indicators*', {
    fixture: 'indicators/index',
  }).as('fetchIndicators');

  cy.intercept('GET', '/api/v1/indicators/*', {
    fixture: 'indicators/show',
  });

  // Materials
  cy.intercept('GET', '/api/v1/materials/*', {
    fixture: 'materials/show.json',
  });

  // Filter requests
  cy.intercept('GET', '/api/v1/h3/years*', {
    statusCode: 200,
    fixture: 'years/index',
  });

  cy.intercept('GET', '/api/v1/business-units/trees?depth=1*', {
    statusCode: 200,
    fixture: 'trees/business-units',
  }).as('businessUnitsTrees');

  cy.intercept('GET', '/api/v1/materials/trees*', {
    statusCode: 200,
    fixture: 'trees/materials',
  }).as('materialsTrees');

  cy.intercept('GET', '/api/v1/suppliers/trees*', {
    statusCode: 200,
    fixture: 'trees/suppliers',
  }).as('suppliersTrees');

  cy.intercept(
    'GET',
    '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
  ).as('treesSelectorsWithScenarioId');

  cy.intercept('GET', '/api/v1/sourcing-locations/location-types*', {
    statusCode: 200,
    fixture: 'location-types/index',
  });

  cy.intercept('GET', '/api/v1/sourcing-locations/location-types/supported', {
    fixture: 'sourcing-locations/supported',
  }).as('supportedLocationTypes');

  cy.intercept('GET', '/api/v1/admin-regions/trees*', {
    statusCode: 200,
    fixture: 'trees/admin-regions',
  }).as('originsTrees');

  // Scenario requests
  cy.intercept('GET', '/api/v1/scenarios*', {
    statusCode: 200,
    fixture: 'scenario/scenarios',
  }).as('scenariosList');

  cy.intercept(
    {
      method: 'GET',
      pathname: '/api/v1/scenarios/*',
    },
    {
      statusCode: 200,
      fixture: 'scenario/scenario-creation',
    },
  );

  cy.intercept(
    {
      method: 'GET',
      pathname: '/api/v1/scenarios',
      query: {
        hasActiveInterventions: 'true',
      },
    },
    {
      statusCode: 200,
      fixture: 'scenario/scenarios',
    },
  ).as('scenariosNoPaginated');

  cy.intercept('GET', '/api/v1/impact/compare/scenario/vs/actual?*', {
    statusCode: 200,
    fixture: 'scenario/scenario-vs-actual',
  }).as('scenarioVsActual');

  cy.intercept('GET', '/api/v1/impact/compare/scenario/vs/scenario?*', {
    statusCode: 200,
    fixture: 'scenario/scenario-vs-scenario',
  }).as('scenarioVsScenario');

  cy.intercept('POST', '/api/v1/scenarios', {
    statusCode: 201,
    fixture: 'scenario/scenario-creation',
  }).as('scenarioCreation');

  cy.intercept('DELETE', '/api/v1/scenarios/**', {
    statusCode: 200,
  }).as('deleteScenario');

  // Intervention requests
  cy.intercept('GET', '/api/v1/scenarios/**/interventions*', {
    statusCode: 200,
    fixture: 'scenario/scenario-interventions',
  }).as('fetchScenarioInterventions');

  cy.intercept('PATCH', '/api/v1/scenario-interventions/random-intervention-id', {
    statusCode: 200,
    fixture: 'intervention/intervention-creation-dto',
  }).as('successfulInterventionEdition');

  // Layer requests
  cy.intercept('GET', '/api/v1/h3/map/impact*', {
    fixture: 'layers/impact-layer.json',
  }).as('fetchImpactMap');

  // Contextual layer requests
  cy.intercept('GET', '/api/v1/contextual-layers/categories', {
    fixture: 'layers/contextual-layer-categories.json',
  }).as('fetchContextualLayerCategories');

  cy.intercept('GET', '/api/v1/contextual-layers/**/h3data*', {
    fixture: 'layers/contextual-layer.json',
  }).as('fetchContextualLayerH3Data');

  cy.intercept('GET', '/api/v1/h3/map/material*', {
    fixture: 'layers/material-layer.json',
  }).as('fetchMaterialLayerH3Data');

  // Impact table requests
  cy.intercept('GET', '/api/v1/impact/table*', {
    fixture: 'impact/table',
  }).as('fetchImpactTable');

  // Impact chart requests
  cy.intercept('GET', '/api/v1/impact/ranking?*', {
    fixture: 'impact/chart',
  }).as('fetchChartRanking');

  // Tasks requests
  cy.intercept('GET', '/api/v1/tasks*', {
    statusCode: 200,
    fixture: 'tasks/index',
  });

  // Sourcing locations data requests
  cy.intercept('GET', '/api/v1/sourcing-locations*', {
    statusCode: 200,
    fixture: 'sourcing-locations/index',
  });

  // Sourcing record years requests
  cy.intercept('GET', '/api/v1/sourcing-records/years', {
    statusCode: 200,
    fixture: 'scenario/scenario-years',
  }).as('sourcingRecordYears');

  // Tier 1 suppliers requests
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

  // Profile
  cy.intercept('api/v1/users/me', { fixture: 'profiles/all-permissions' }).as('profile');
});
