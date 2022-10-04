import React from 'react';

import Image from 'next/image';

// import ContentCard from 'containers/content-card';
import Wrapper from 'containers/wrapper';

const AnalyzeContent: React.FC = () => (
  <Wrapper hasPadding={false}>
    <section className="grid md:grid-cols-12 gap-x-10 gap-y-28 mb-28">
      <div className="md:col-span-5 space-y-10 self-items-center">
        <h3 className="font-heading-4 font-semibold mt-10">
          See your whole supply chain sourcing area on one map.
        </h3>
        <p>
          Map out sourcing areas, analyze by total impact, risk metrics, or volumes, drill down to
          individual suppliers, and see the scientific data sources that were used to calculate
          their impacts.
        </p>
      </div>
      <div className="md:col-span-7 flex justify-end">
        <Image width="657px" height="351px" src="/images/analyze/analyze-2.jpg" />
      </div>

      <div className="md:col-span-7">
        <Image width="657px" height="351px" src="/images/analyze/analyze-3.jpg" />
      </div>
      <div className="md:col-span-5 space-y-10 self-items-center">
        <h3 className="font-heading-4 font-semibold mt-10">
          Customized tools to meet the needs of your organization.
        </h3>
        <p>
          Use the power of diverse data visualization through charts, tables, and map views. Export
          reports, figures, and KPIs for financial reporting standards such as CDP, GRI, and SASB.
        </p>
      </div>
    </section>
  </Wrapper>
);

export default AnalyzeContent;
