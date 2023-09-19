describe('Analysis scenarios', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.loginWithFixtures();
  });

  afterEach(() => {
    cy.logout();
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
});
