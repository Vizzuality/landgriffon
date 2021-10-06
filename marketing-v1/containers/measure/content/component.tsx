import React from 'react';

import ContentCard from 'containers/content-card';
import Wrapper from 'containers/wrapper';

const MeasureContent: React.FC = () => (
  <Wrapper>
    <section className="flex flex-col justify-center md:py-20 md:px-16 md:space-x-64 md:flex-row">
      <ContentCard
        orientation="vertical"
        hyperlink="/"
        imageURL="/images/measure/measure-2.jpg"
        title="Track and anticipate deforestation risk with Satelligence AI."
        description="Be the first to know about deforestation risk in your supply chain and identify responsible parties to get ahead of grievances."
      />
      <ContentCard
        orientation="vertical"
        imageURL="/images/measure/measure-3.jpg"
        title="Calculate impacts with our catalog of trusted data."
        description="Generate accurate estimates of carbon emissions, water risk, and more based on trusted data from leading scientific and NGO sources. Add custom indicators and targets to track risks or progress over time."
      />
    </section>
  </Wrapper>
);

export default MeasureContent;
