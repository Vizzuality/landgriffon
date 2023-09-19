import { ADMIN_TABS, MENU_ITEM_DISABLED_STYLE } from '../../src/layouts/admin/constants';

import type { TabType } from '../../src/components/tabs/types';

const disabledLinks = Object.values(ADMIN_TABS).filter(
  (value: TabType) => value.disabled,
) as TabType[];

describe('Data page - admin', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.intercept('/api/v1/users/me', { fixture: 'profiles/admin' });
    cy.login();
    cy.visit('/data');
    cy.wait('@sourcingLocations');
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

  // THIS FEATURE IS DISABLED
  // it('should search input be disabled', () => {
  //   cy.get('input[data-testid="data-search-input"]')
  //     .should('be.disabled')
  //     .should('have.class', 'bg-gray-300/20');
  // });

  it('admin should be able to upload data source', () => {
    cy.get('[data-testid="upload-data-source-btn"]').should('not.be.disabled');
  });
});

describe('Data page - user', () => {
  beforeEach(() => {
    cy.interceptAllRequests();
    cy.loginWithFixtures();
    cy.visit('/data');
    cy.wait('@sourcingLocations');
  });

  afterEach(() => {
    cy.logout();
  });

  it('not admin user should not be able to upload data source', () => {
    cy.intercept('/api/v1/users/me', { fixture: 'profiles/no-permissions' }).as('user-profile');
    cy.wait('@user-profile');
    cy.get('[data-testid="upload-data-source-btn"]').should('be.disabled');
  });
});
