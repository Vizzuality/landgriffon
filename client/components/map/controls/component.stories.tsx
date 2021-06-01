import { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

import Controls, { ControlsProps } from './component';

export default {
  title: 'Components/Map/Controls',
  component: Controls,
};

const Template: Story<ControlsProps> = (args) => {
  const [viewport, setViewport] = useState({
    zoom: 3,
    minZoom: 2,
    maxZoom: 10,
  });

  return (
    <div className="relative h-24">
      <Controls {...args}>
        <ZoomControl
          viewport={viewport}
          onZoomChange={(zoom) => {
            setViewport({
              ...viewport,
              zoom,
            });
          }}
        />

        <FitBoundsControl
          bounds={{
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
              transitionDuration: 1500,
            },
          }}
          onFitBoundsChange={(bounds) => {
            console.info(bounds);
          }}
        />
      </Controls>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: 'w-10 absolute bottom-0 left-0',
};
