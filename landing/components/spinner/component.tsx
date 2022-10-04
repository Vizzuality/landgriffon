import React from 'react';
import AnimationPlayer from 'components/animation-player';
import spinnerWhite from './spinner-white.json';

const Spinner: React.FC = () => (
  <AnimationPlayer animationData={spinnerWhite} />
);

export default Spinner;
