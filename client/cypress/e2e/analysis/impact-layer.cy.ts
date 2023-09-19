describe('Analysis: map impact layer', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/h3/map/impact*', {
      fixture: 'layers/impact-layer.json',
    }).as('fetchImpactMap');
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  /**
   * We're assuming mapbox is working as expected, and we'll just check that the request is made
   */
  it('request the impact layer', () => {
    cy.visit('/analysis/map');

    cy.get('canvas.mapboxgl-canvas').should('be.visible');

    cy.wait('@fetchImpactMap').then((interception) => {
      cy.wrap(JSON.stringify(interception.response.body.data[0])).should(
        'be.equal',
        JSON.stringify({
          h: '84df6b7ffffffff',
          v: '26924145.89',
        }),
      );
    });
  });
});
