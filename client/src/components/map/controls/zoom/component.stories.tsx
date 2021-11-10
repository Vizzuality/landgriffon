import { useState } from 'react';
import { Story } from '@storybook/react';
import ZoomControl from './component';
import type { ZoomControlProps } from './component';

const StorybookModule = {
  title: 'Components/Map/Controls/Zoom',
  component: ZoomControl,
};

const Template: Story<ZoomControlProps> = (args) => {
  const [viewport, setViewport] = useState({
    zoom: 3,
    minZoom: 2,
    maxZoom: 10,
  });

  return (
    <ZoomControl
      {...args}
      viewport={viewport}
      onZoomChange={(zoom) => {
        setViewport({
          ...viewport,
          zoom,
        });
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  className: '',
  viewport: {
    zoom: 3,
    minZoom: 2,
    maxZoom: 10,
  },
  onZoomChange: (zoom) => {
    console.info(zoom);
  },
};

export default StorybookModule;
