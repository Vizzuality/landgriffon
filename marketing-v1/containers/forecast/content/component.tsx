import React from 'react';

import ContentCard from 'containers/content-card';
import Wrapper from 'containers/wrapper';

export const ForecastContent = () => (
  <Wrapper>
    <section className="flex flex-col justify-center px-16 py-36 space-y-36">
      <ContentCard
        orientation="horizontal"
        reverse
        imageURL="/images/forecast/forecast-2.jpg"
        title="Explore sourcing options to find the best path forward."
        description="See how buying from different suppliers, changing product formulas, or partnering with others can improve supply chain performance. Analyze the trade offs between different approaches to build an argument for change."
      />
      <ContentCard
        orientation="horizontal"
        imageURL="/images/forecast/forecast-3.jpg"
        title="Plot a path to sustainability."
        description="Draw out a plan for how your company will reach its targets. Illustrate and communicate how your company can and must evolve to be successful in tomorrow’s world."
      />
    </section>
  </Wrapper>
);

export default ForecastContent;
