import { useCallback, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

// Layer manager
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

// Map
import Map, { MapProps } from './component';
import LAYERS from './layers';

export default {
  title: 'Components/Map',
  component: Map,
  argTypes: {
    ReactMapGLAttributes: {
      name: 'All ReactMapGL props',
      description: 'http://visgl.github.io/react-map-gl/',
      table: {
        type: {
          summary: 'ReactMapGLAttributes',
        },
      },
      control: {
        disable: true,
      },
    },
    mapboxApiAccessToken: {
      description:
        'http://visgl.github.io/react-map-gl/docs/api-reference/static-map#mapboxapiaccesstoken',
      table: {
        type: {
          summary: 'ReactMapGLAttributes',
        },
      },
      control: {
        disable: true,
      },
    },
    children: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<MapProps> = (args: MapProps) => {
  const { bounds: aBounds } = args;
  const minZoom = 2;
  const maxZoom = 10;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(aBounds);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  const handleZoomChange = useCallback(
    (zoom) => {
      setViewport({
        ...viewport,
        zoom,
        transitionDuration: 500,
      });
    },
    [viewport],
  );

  const handleFitBoundsChange = useCallback((b) => {
    setBounds(b);
  }, []);

  return (
    <div className="relative w-full h-96">
      <Map
        {...args}
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
        onMapViewportChange={handleViewportChange}
      >
        {(map) => (
          <LayerManager map={map} plugin={PluginMapboxGl}>
            {LAYERS.map((l) => (
              <Layer key={l.id} {...l} />
            ))}
          </LayerManager>
        )}
      </Map>

      <Controls>
        <ZoomControl
          viewport={{
            ...viewport,
            minZoom,
            maxZoom,
          }}
          onZoomChange={handleZoomChange}
        />

        <FitBoundsControl
          bounds={{
            ...bounds,
            viewportOptions: {
              transitionDuration: 1500,
            },
          }}
          onFitBoundsChange={handleFitBoundsChange}
        />
      </Controls>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: '',
  viewport: {},
  bounds: {
    bbox: [
      10.5194091796875,
      43.6499881760459,
      10.9588623046875,
      44.01257086123085,
    ],
    options: {
      padding: 50,
    },
    viewportOptions: {
      transitionDuration: 0,
    },
  },
  onMapViewportChange: (viewport) => {
    console.info('onMapViewportChange: ', viewport);
  },
  onMapReady: ({ map, mapContainer }) => {
    console.info('onMapReady: ', map, mapContainer);
  },
  onMapLoad: ({ map, mapContainer }) => {
    console.info('onMapLoad: ', map, mapContainer);
  },
};
