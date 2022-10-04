import { createMedia } from '@artsy/fresnel';

import SCREENS from 'utils/media';

const AppMedia = createMedia({
  breakpoints: SCREENS,
});

// Make styles for injection into the header of the page
export const mediaStyles = AppMedia.createMediaStyle();
export const { Media, MediaContextProvider } = AppMedia;
