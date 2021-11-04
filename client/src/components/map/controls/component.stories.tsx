/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import { Story } from '@storybook/react';

import ZoomControl from 'components/map/controls/zoom';

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
      </Controls>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: 'w-10 absolute bottom-0 left-0',
};
