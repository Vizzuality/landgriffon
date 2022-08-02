import { getSession } from 'next-auth/react';

import type { Session } from 'next-auth';

describe('Scenarios', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should be able to see the scenarios page', async () => {
    cy.visit('/admin/scenarios');
    cy.url().should('contain', '/admin/scenarios');
    cy.get('h1').should('have.text', 'Manage scenarios data');
    cy.log('Scenarios is selected in the menu bar');
    cy.get('[data-testisactive="true"]').should('have.text', 'Scenarios');
  });

  it('should show same scenarios cards length than API', () => {
    cy.visit('/admin/scenarios');
    cy.wrap(getSession()).then((session: Session) => {
      cy.request({
        url: `${Cypress.env('API_URL')}/api/v1/scenarios`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .its('body')
        .then((response) => {
          cy.get('[data-testid="scenario-card"]').should('have.length', response.data.length);
        });
    });
  });

  it('should allow create new scenarios and come back', () => {
    cy.visit('/admin/scenarios');
    cy.get('[data-testid="scenario-add-button"]')
      .should('have.text', 'Add scenario')
      .click()
      .url()
      .should('contain', '/admin/scenarios/new');
    cy.get('[data-testid="scenario-back-button"]')
      .click()
      .url()
      .should('contain', '/admin/scenarios');
  });
});
