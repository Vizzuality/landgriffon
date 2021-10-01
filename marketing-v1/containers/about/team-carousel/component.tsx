import React, { useRef } from 'react';

import Card from './card';
import TEAM from './constants';

export const TeamCarousel = () => {
  const cardRef = useRef();
  return (
    <div className="flex space-x-5 bg-lightBlue">
      {TEAM.map((t) => (
        <div ref={cardRef}>
          <Card key={t.key} role={t.role} name={t.name} photo={t.img} />
        </div>
      ))}
      <button type="button">Previous</button>
      <button type="button">Next</button>
    </div>
  );
};

export default TeamCarousel;
