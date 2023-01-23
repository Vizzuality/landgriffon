import { ADMIN_TABS, MENU_ITEM_DISABLED_STYLE } from '../../src/layouts/admin/constants';

import type { TabType } from '../../src/components/tabs/types';

const disabledLinks = Object.values(ADMIN_TABS).filter(
  (value: TabType) => value.disabled,
) as TabType[];

describe('Data page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/data');
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
