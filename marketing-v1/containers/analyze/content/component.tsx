import React from 'react';

import ContentCard from 'containers/content-card';
import Wrapper from 'containers/wrapper';

export const AnalyzeContent = () => (
  <Wrapper>
    <section className="flex flex-col justify-center px-16 py-36 space-y-36">
      <ContentCard
        orientation="horizontal"
        reverse
        imageURL="/images/analyze/analyze-2.jpg"
        title="See your whole supply chain sourcing area on one map."
        description="Map out sourcing areas, analyze by total impact, risk metrics, or volumes, drill down to individual suppliers, and see the scientific data sources that were used to calculate their impacts."
      />
      <ContentCard
        orientation="horizontal"
        imageURL="/images/analyze/analyze-3.jpg"
        title="Customized tools to meet the needs of your organization."
        description="Use the power of diverse data visualization through charts, tables, and map views. Export reports, figures, and KPIs for financial reporting standards such as CDP, GRI, and SASB."
      />
    </section>
  </Wrapper>
);

export default AnalyzeContent;
