describe('Analysis and scenarios', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/scenarios*',
        query: {
          include: 'scenarioInterventions',
          'page[number]': '1',
          'page[size]': '10',
          sort: '-updatedAt',
        },
      },
      {
        statusCode: 200,
        fixture: 'scenario/scenarios',
      },
    ).as('scenariosList');

    cy.login();
    cy.visit('/analysis/chart');
  });

  it('should be able to see the analysis page', () => {
    cy.visit('/analysis/map');
    cy.url().should('contain', '/analysis/map');
  });

  it('users with "canCreateScenario" permission should be able to click add new scenario button', () => {
    cy.intercept('/api/v1/users/me', { fixture: '/profiles/all-permissions.json' }).as('profile');
    cy.visit('/analysis/map');
    cy.wait('@profile');
    cy.get('a[data-testid="create-scenario"]').click();
    cy.wait('@profile');
    cy.url().should('contain', '/data/scenarios/new');
  });

  it('users without "canCreateScenario" permission should not be able to click add new scenario button', () => {
    cy.intercept('/api/v1/users/me', { fixture: '/profiles/no-permissions.json' });
    cy.visit('/analysis/map');
    cy.get('a[data-testid="create-scenario"]').should('not.exist');
  });

  it('should be scenarioIds empty when there is no scenario selected in the more filters endpoints', () => {
    cy.intercept('GET', '/api/v1/**/trees?*').as('treesSelectors');
    cy.visit('/analysis/table');
    cy.wait('@treesSelectors').then((interception) => {
      const url = new URL(interception.request.url);
      const scenarioIds = url.searchParams.get('scenarioIds');
      expect(scenarioIds).to.be.null;
    });
  });

  // it('should be able to select a scenario vs actual data in the comparison select', () => {
  //   cy.visit('/analysis/table');
  //   cy.wait('@scenariosNoPaginated');

  //   cy.intercept(
  //     'GET',
  //     '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
  //   ).as('treesSelectorsWithScenarioId');

  //   cy.get('[data-testid="scenario-item-null"]') // actual data
  //     .find('[data-testid="select-comparison"]')
  //     .click()
  //     .find('input:visible')
  //     .type('Test{enter}');

  //   cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

  //   // checking comparison cell is there
  //   cy.wait('@scenarioVsActual')
  //     .its('request.url')
  //     .should('contain', 'comparedScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  //   cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);

  //   // checking tree selectors on more filers
  //   cy.wait('@treesSelectorsWithScenarioId')
  //     .its('request.url')
  //     .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  // });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.intercept(
      'GET',
      '/api/v1/impact/table?*scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7*',
    ).as('fetchImpactTableData');
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');
    cy.wait('@scenariosList');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="scenario-item-radio"]')
      .click();

    cy.wait('@fetchImpactTableData')
      .its('request.url')
      .should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.url().should('contain', 'scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    cy.intercept({
      path: '/api/v1/**/trees?*scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('treesSelectorsWithBothScenarioIds');

    cy.get('[data-testid="scenario-item-8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7"]')
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .type('Example{enter}');

    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithBothScenarioIds')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .and('contain', 'scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking comparison cell is there
    cy.wait('@scenarioVsScenario')
      .its('request.url')
      .should('contain', 'comparedScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.wait('@scenariosNoPaginated');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .should('not.contain', 'disabledPagination');

    // checking the charts
    cy.get('[data-testid="analysis-chart"]').should('not.be.empty');
  });

  afterEach(() => {
    cy.logout();
  });
});
