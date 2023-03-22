import {
  DEFAULT_END_YEAR_GAP,
  MAX_END_YEAR_RANGE,
} from '../../src/containers/analysis-visualization/analysis-filters/years-range/constants';

beforeEach(() => {
  cy.interceptAllRequests();
  cy.login();
});

afterEach(() => {
  cy.logout();
});

describe('Analysis tab', () => {
  beforeEach(() => {
    cy.visit('/analysis');
  });

  it('should navigate to map, table, and chart', () => {
    cy.wait(['@fetchImpactMap', '@fetchIndicators', '@fetchContextualLayerCategories']);
    cy.get('[data-testid="analysis-map"]').should('be.visible');
    cy.url().should('contain', '/analysis/map');

    cy.get('[data-testid="mode-control-table"]').click();
    cy.wait('@fetchImpactTable');
    cy.get('[data-testid="analysis-table"]').should('be.visible');
    cy.url().should('contain', '/analysis/table');

    cy.get('[data-testid="mode-control-chart"]').click();
    cy.wait('@fetchChartRanking');
    cy.get('[data-testid="analysis-charts"]').should('be.visible');
    cy.url().should('contain', '/analysis/chart');

    cy.get('[data-testid="mode-control-map"]').click();
    cy.get('[data-testid="analysis-map"]').should('be.visible');
    cy.url().should('contain', '/analysis/map');
  });
});

describe('Analysis filters', () => {
  beforeEach(() => {
    cy.visit('/analysis/map');
  });

  it('should be able to select an indicator', () => {
    cy.intercept('GET', '/api/v1/indicators*', {
      fixture: 'indicators/index',
    }).as('fetchIndicators');

    cy.visit('/analysis/table');

    cy.wait('@fetchIndicators').then((interception) => {
      expect(interception.response.body?.data).have.length(5);
    });
    cy.get('[data-testid="analysis-table"]').should('be.visible');

    cy.url().should('not.include', 'indicator');

    // select indicator
    cy.get('[data-testid="select-indicators-filter"]').find('button').type('{enter}{enter}');

    cy.url().should('include', 'indicator=all');

    cy.get('[data-testid="select-indicators-filter"] button').click();
    cy.get('[data-testid="select-indicators-filter"] ul li:first').next().click();

    cy.url().should('include', 'indicator=5c595ac7-f144-485f-9f32-601f6faae9fe'); // Land use
  });

  it('should update the params playing with the filters', () => {
    cy.visit('/analysis/table');

    // Step 1: open more filters
    cy.get('[data-testid="more-filters-button"]').click();
    cy.wait('@materialsTrees');
    cy.wait('@originsTrees');
    cy.wait('@suppliersTrees');
    cy.wait('@fetchImpactTable');

    // Adding new interceptors after selecting a filter
    cy.intercept(
      'GET',
      '/api/v1/suppliers/trees?*originIds[]=8bd7e578-f64f-4042-8a3a-2a7652ce850b*',
      {
        fixture: 'trees/suppliers-filtered.json',
      },
    ).as('suppliersTreesFiltered');

    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/v1/materials/trees',
        query: {
          'supplierIds[]': 'c8bca40d-1aec-44e3-b82b-8170898800ad',
        },
      },
      {
        fixture: 'trees/materials-filtered.json',
      },
    ).as('materialsTreesFiltered');
    cy.wait('@locationTypes');

    // Step 2: Selecting Angola in the admin regions selector
    cy.get('[data-testid="tree-select-origins-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-origins-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode')
      .eq(1)
      .click();
    cy.get('[data-testid="tree-select-origins-filter"]')
      .find('input:visible:first')
      .type('{enter}');
    cy.wait('@locationTypes');
    // Step 3: Selecting Moll in the material selector
    cy.wait('@suppliersTreesFiltered');
    cy.get('[data-testid="tree-select-suppliers-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-suppliers-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode')
      .eq(1)
      .click();
    cy.wait('@locationTypes');
    // Step 4: Checking material selector
    cy.wait('@materialsTreesFiltered')
      .its('request.url')
      .should('include', '8bd7e578-f64f-4042-8a3a-2a7652ce850b');

    cy.get('[data-testid="tree-select-materials-filter"]').find('div[role="combobox"]').click();
    cy.get('[data-testid="tree-select-materials-filter"]')
      .find('div[role="listbox"]')
      .find('.rc-tree-treenode:visible')
      .should('have.length', 1); // first treenode is empty
  });
});

describe('Analysis contextual layers', () => {
  beforeEach(() => {
    cy.visit('/analysis/map');
  });

  it('requests should not include the params indicatorId and should be in resolution 4', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]')
      .find('[data-testid="switch-button"]')
      .click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchContextualLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });

  it('materials requests should not include the params indicatorId and should be in resolution 4', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="contextual-material-header"]')
      .click()
      .find('[data-testid="switch-button"]')
      .click();
    cy.wait(100);
    cy.get('[data-testid="contextual-material-content"]')
      .find('[data-testid="tree-select-material"]')
      .find('input[type="search"]')
      .type('Cotton');
    cy.get('[data-testid="tree-select-search-results"]').find('button').click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchMaterialLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });
});

describe('Analysis table', () => {
  beforeEach(() => {
    cy.visit('/analysis/table');
  });

  it('should load the table', () => {
    cy.wait(['@fetchIndicators', '@fetchImpactTable']).then(() => {
      cy.get('[data-testid="analysis-table"]').should('be.visible');
    });
  });

  it('user should be able to select year filters', () => {
    cy.wait('@h3Years').then((int) => {
      const years = int.response.body.data;
      // Check default filter values
      cy.wait('@fetchImpactTable').then((req) => {
        expect(req.request.query.startYear).to.eq(years[0].toString());
        expect(req.request.query.endYear).to.eq(
          (years[years.length - 1] + DEFAULT_END_YEAR_GAP).toString(),
        );
      });

      // Check 'from' options
      cy.get('[data-testid="years-range-btn"]').click();
      cy.get('[data-testid="select-year-selector-from"]').click();
      cy.get('[data-testid="year-selector-from-option"]').should('have.length', years.length);

      const fromYear = years[2];
      // Check if can select a typed value
      cy.get('[data-testid="select-year-selector-from"] input')
        .focus()
        .clear({ force: true })
        .type(`${fromYear}{enter}`, {
          force: true,
        })
        .should('have.value', fromYear);
      // Check if the payload request is correct
      cy.wait('@fetchImpactTable')
        .its('request.query.startYear')
        .should('eql', fromYear.toString());

      const toYear = years[0] + MAX_END_YEAR_RANGE;
      // Years dialog is already open
      cy.get('[data-testid="select-year-selector-to"]').click();

      // Check that the 'to' options years smaller than the selected 'from' year are disabled
      cy.get('.ReactVirtualized__List').scrollTo('top'); // select dialog portal to the top to show the options
      cy.get('[data-testid="year-selector-to-option"][aria-disabled="true"]').should(
        'have.length',
        3,
      );

      // Check if can select a typed value
      cy.get('[data-testid="select-year-selector-to"] input')
        .focus()
        .clear({ force: true })
        .type(`${toYear}`, {
          force: true,
          delay: 300,
        })
        .type('{enter}', { force: true })
        .should('have.value', toYear);
      // Check if the payload request is correct
      cy.wait('@fetchImpactTable').its('request.query.endYear').should('eql', toYear.toString());
    });
  });

  it('should sort actual data impact by year', () => {
    cy.wait('@fetchImpactTable');

    // Sort DESC
    cy.get('table th')
      .eq(3)
      .find('div>div>div:last')
      .as('lastYearColumnSortBtn')
      .click({ force: true });
    cy.wait('@fetchImpactTable').then((i) => {
      expect(i.request.query).haveOwnProperty('sortingYear');
      expect(i.request.query.sortingOrder).eq('DESC');
    });
    // Sort ASC
    cy.get('@lastYearColumnSortBtn').click({ force: true });
    cy.wait('@fetchImpactTable').then((i) => {
      expect(i.request.query).haveOwnProperty('sortingYear');
      expect(i.request.query.sortingOrder).eq('ASC');
    });
    // Remove sort
    cy.get('@lastYearColumnSortBtn').click({ force: true });
    cy.wait('@fetchImpactTable')
      .its('request.query')
      .should('not.include.any.keys', 'sortingYear', 'sortingOrder');
  });

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');

    cy.intercept(
      'GET',
      '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    ).as('treesSelectorsWithScenarioId');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .focus()
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking comparison cell is there
    cy.wait('@scenarioVsActual')
      .its('request.url')
      .should('contain', 'comparedScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.intercept(
      'GET',
      '/api/v1/impact/table?*scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7*',
    ).as('fetchImpactTableData');

    // ? locations filtered by comparison of a scenario
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    }).as('locationTypesWithSingleScenario');

    // ? locations filtered by comparison of two scenarios
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7&scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('locationTypesWithScenarioComparison');

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
      .focus()
      .type('Example{enter}');

    cy.wait('@locationTypesWithSingleScenario').its('response.statusCode').should('eq', 200);

    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithBothScenarioIds')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .and('contain', 'scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    cy.wait('@locationTypesWithScenarioComparison').its('response.statusCode').should('eq', 200);

    // checking comparison cell is there
    cy.wait('@scenarioVsScenario')
      .its('request.url')
      .should('contain', 'comparedScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);
  });
});

describe('Analysis contextual layers', () => {
  beforeEach(() => {
    cy.visit('/analysis/map');
  });

  it('requests should not include the params indicatorId and should be in resolution 4', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="category-header-Environmental datasets"]').click();
    cy.get('[data-testid="layer-settings-item-Agriculture blue water footprint"]')
      .find('[data-testid="switch-button"]')
      .click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchContextualLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });

  it('materials requests should not include the params indicatorId and should be in resolution 4', () => {
    cy.wait(['@fetchIndicators', '@fetchContextualLayerCategories']);

    cy.get('[data-testid="contextual-layer-modal-toggle"]').click();
    cy.get('[data-testid="contextual-material-header"]')
      .click()
      .find('[data-testid="switch-button"]')
      .click();
    cy.wait(100);
    cy.get('[data-testid="contextual-material-content"]')
      .find('[data-testid="tree-select-material"]')
      .find('input[type="search"]')
      .type('Cotton');
    cy.get('[data-testid="tree-select-search-results"]').find('button').click();
    cy.get('[data-testid="contextual-layer-apply-button"').click();

    cy.wait('@fetchMaterialLayerH3Data').then((interception) => {
      expect(interception.request.url).not.to.contain('indicatorId');
      expect(interception.request.url).contain('year');
      expect(interception.request.url).contain('resolution=4');
    });
  });
});

describe('Analysis charts', () => {
  beforeEach(() => {
    cy.visit('/analysis/chart');
  });

  it('should load one chart per indicator', () => {
    cy.wait(['@fetchIndicators', '@fetchChartRanking']).then(() => {
      cy.get('[data-testid="analysis-chart"]').as('chart');
      cy.get('@chart').should('be.visible');
      cy.get('@chart').find('.recharts-responsive-container').and('have.length', 5);
    });
  });
});

describe('Analysis table', () => {
  beforeEach(() => {
    cy.visit('/analysis/table');
  });

  it('should load the table', () => {
    cy.wait(['@fetchIndicators', '@fetchImpactTable']).then(() => {
      cy.get('[data-testid="analysis-table"]').should('be.visible');
    });
  });
});

describe('Analysis scenarios', () => {
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

  it('should be able to select a scenario vs actual data in the comparison select', () => {
    cy.visit('/analysis/table');
    cy.wait('@scenariosNoPaginated');

    cy.intercept(
      'GET',
      '/api/v1/**/trees?withSourcingLocations=true&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    ).as('treesSelectorsWithScenarioId');

    cy.get('[data-testid="scenario-item-null"]') // actual data
      .find('[data-testid="select-comparison"]')
      .click()
      .find('input:visible')
      .focus()
      .type('Test{enter}');

    cy.url().should('contain', 'compareScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');

    // checking comparison cell is there
    cy.wait('@scenarioVsActual')
      .its('request.url')
      .should('contain', 'comparedScenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithScenarioId')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7');
  });

  it('should be able to select a scenario vs scenario in the comparison select', () => {
    cy.intercept(
      'GET',
      '/api/v1/impact/table?*scenarioId=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7*',
    ).as('fetchImpactTableData');

    // ? locations filtered by comparison of a scenario
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7',
    }).as('locationTypesWithSingleScenario');

    // ? locations filtered by comparison of two scenarios
    cy.intercept({
      path: '/api/v1/sourcing-locations/location-types?sort=DESC&scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7&scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af',
    }).as('locationTypesWithScenarioComparison');

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
      .focus()
      .type('Example{enter}');

    cy.wait('@locationTypesWithSingleScenario').its('response.statusCode').should('eq', 200);

    cy.url().should('contain', 'compareScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    // checking tree selectors on more filers
    cy.wait('@treesSelectorsWithBothScenarioIds')
      .its('request.url')
      .should('contain', 'scenarioIds[]=8dfd0ce0-67b7-4f1d-be9c-41bc3ceafde7')
      .and('contain', 'scenarioIds[]=7646039e-b2e0-4bd5-90fd-925e5868f9af');

    cy.wait('@locationTypesWithScenarioComparison').its('response.statusCode').should('eq', 200);

    // checking comparison cell is there
    cy.wait('@scenarioVsScenario')
      .its('request.url')
      .should('contain', 'comparedScenarioId=7646039e-b2e0-4bd5-90fd-925e5868f9af');
    cy.get('[data-testid="comparison-cell"]').should('have.length.above', 1);
  });
});

describe('Analysis charts', () => {
  beforeEach(() => {
    cy.visit('/analysis/chart');
  });

  it('should load one chart per indicator', () => {
    cy.wait(['@fetchIndicators', '@fetchChartRanking']).then(() => {
      cy.get('[data-testid="analysis-chart"]').as('chart');
      cy.get('@chart').should('be.visible');
      cy.get('@chart').find('.recharts-responsive-container').and('have.length', 5);
    });
  });
});
