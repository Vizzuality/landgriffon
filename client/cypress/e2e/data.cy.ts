import { ADMIN_TABS, MENU_ITEM_DISABLED_STYLE } from '../../src/layouts/admin/constants';

import type { TabType } from '../../src/components/tabs/types';

const disabledLinks = Object.values(ADMIN_TABS).filter(
  (value: TabType) => value.disabled,
) as TabType[];

describe('Data page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/sourcing-locations/location-types*', {
      statusCode: 200,
      fixture: 'location-types/index',
    });

    cy.intercept('GET', '/api/v1/tasks*', {
      statusCode: 200,
      fixture: 'tasks/index',
    });

    cy.intercept('GET', '/api/v1/sourcing-locations*', {
      statusCode: 200,
      fixture: 'sourcing-locations/index',
    });

    cy.login();
    cy.visit('/data');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should disabled menu links be disabled', () => {
    disabledLinks.forEach((tab) => {
      cy.get(`span[data-testname="admin-menu-item-${tab.name}"]`).should(
        'have.class',
        MENU_ITEM_DISABLED_STYLE,
      );
    });
  });

  it('should search input be disabled', () => {
    cy.get('input[data-testid="data-search-input"]')
      .should('be.disabled')
      .should('have.class', 'bg-gray-300/20');
  });
});
