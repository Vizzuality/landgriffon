import type { StyleIds } from './constants';
import type { ViewState, MapProps, FitBoundsOptions, MapRef } from 'react-map-gl/maplibre';

export type MapStyle = keyof typeof StyleIds;

export interface CustomMapProps extends MapProps {
  /** A function that returns the map instance */
  children?: (map: typeof MapRef.getMap) => React.ReactNode;

  /** Custom css class for styling */
  className?: string;

  mapStyle: MapStyle;

  /** An object that defines the viewport
   * @see https://visgl.github.io/react-map-gl/docs/api-reference/map#initialviewstate
   */
  viewState?: Partial<ViewState>;

  /** An object that defines the bounds */
  bounds?: {
    bbox: [number, number, number, number];
    options?: FitBoundsOptions;
    viewportOptions?: Partial<ViewState>;
  };

  /** A function that exposes the viewport */
  onMapViewStateChange?: (viewstate: Partial<ViewState>) => void;

  /** Whether the side menu is collapsed. Defaults to 'false' */
  sidebarCollapsed?: boolean;
}
