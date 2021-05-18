import React from 'react';

import { themes } from '@storybook/theming';
import { OverlayProvider } from '@react-aria/overlays';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: themes.dark,
  },
};

export const decorators = [
  (Story) => {
    return (
      <OverlayProvider>
        <div>{Story()}</div>
      </OverlayProvider>
    );
  },
];
