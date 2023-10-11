import Link from 'next/link';

const FAQS = [
  {
    id: 1,
    group: 'landgriffon-consortium',
    question: <>What organizations are responsible for LandGriffon?</>,
    answer: (
      <div className="space-y-5">
        <p>
          LandGriffon is
          <a
            className="underline"
            href="https://www.vizzuality.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vizzuality
          </a>{' '}
          powered service. We received funding from the European Union&apos;s Horizon 2020 research
          and innovation program under grant agreement No 101004174. During this time, we were
          supported by{' '}
          <a
            className="underline"
            href="https://satelligence.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Satelligence
          </a>
          ,{' '}
          <a
            className="underline"
            href="https://www.sei.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stockholm Environment Institute
          </a>
          , and{' '}
          <a
            className="underline"
            href="https://www.trase.earth/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trase
          </a>
          , to bring expertise in user-centric design, satellite monitoring, and environmental
          sciences into the early development of LandGriffon.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    group: 'landgriffon-service',
    question: <>What services do you offer around the Landgriffon software?</>,
    answer: (
      <div className="space-y-5">
        <p>
          Landgriffon can be deployed as a standalone software, but we understand that every
          organization has different priorities and operations.
        </p>
        <p>
          We work closely with clients to understand sustainability priorities, gather supply chain
          data, build custom indicators and metrics, integrate with your existing systems, and
          interpret results.
        </p>
      </div>
    ),
  },
  {
    id: 9,
    group: 'landgriffon-service',
    question: <>Do you offer a pilot service?</>,
    answer: (
      <div className="space-y-5">
        <p>
          We want to ensure that we provide the best possible service for your business. That’s why
          we offer a pilot version of LandGriffon so you can get a sense of its capabilities and fit
          your needs.{' '}
          <Link href="/contact">
            <a className="underline">Get in touch</a>
          </Link>{' '}
          to discuss what possibilities there are.
        </p>
      </div>
    ),
  },
  {
    id: 3,
    group: 'landgriffon-service',
    question: <>Do you advise on the sustainability decisions my company should make?</>,
    answer: (
      <div className="space-y-5">
        <p>
          LandGriffon offers tools and data to understand the sources of environmental impacts and
          opportunities to become more sustainable.
        </p>
        <p>
          We work closely with many of the organizations that are leading corporate sustainability
          standards, and can help you understand industry best practices. Where needed, we can
          direct you towards the organizations and information that will support you in making and
          operationalizing sustainability decisions.
        </p>
      </div>
    ),
  },
  {
    id: 4,
    group: 'landgriffon-tool',
    question: <>Why is this the best available impact data?</>,
    answer: (
      <div className="space-y-5">
        <p>
          The indicators we use are from some of the most influential and prominent NGOs and
          organizations in the field of environmental data. Organizations such as Global Forest
          Watch, World Resources Institute, WWF, FAOSTAT, Water Footprint Network, MapSPAM,
          EarthStat, Satelligence, and Aqueduct have been fundamental in getting us globally to the
          understanding we have today of environmental impact assessment and spatial allocation.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    group: 'landgriffon-tool',
    question: <>Why is open source methodology important?</>,
    answer: (
      <div className="space-y-5">
        <p>
          Our methodology is open source for two main reasons. First, the simple reason; openness
          ensures our methods are transparent to all key actors in the field of supply chain
          sustainability, and therefore can be trusted by you, your stakeholders, through to the
          broader sustainability and governance community.
        </p>
        <p>
          Second, we believe the sustainable revolution we urgently need will only come from sharing
          knowledge and expertise. If others can learn from and apply our impact analysis, and
          likewise, push us to improve, then we have a much greater chance at successfully tackling
          global issues. These issues require radical forms of collaboration. Open source
          methodology is one such example.
        </p>
      </div>
    ),
  },
  {
    id: 6,
    group: 'landgriffon-tool',
    question: <>What about LandGriffon can be customized?</>,
    answer: (
      <div className="space-y-5">
        <p>
          The base LandGriffon platform includes the ability to calculate, analyze, and forecast
          supply chain impacts around carbon emissions, land use change, deforestation, water stress
          and biodiversity loss. LandGriffon is designed to be fully customizable, and can be
          expanded to include custom impact and risk indicators, reporting tools, integrations with
          internal IT systems, and more advanced features. Please contact us for more information.
        </p>
      </div>
    ),
  },
  {
    id: 7,
    group: 'supply-chain-data',
    question: (
      <>How detailed does my company&apos;s supply chain data need to be to use LandGriffon?</>
    ),
    answer: (
      <div className="space-y-5">
        <p>
          LandGriffon works with all levels of data precision. Within the platform you can have
          materials with low data precision through to farms with field scale assessments. You can
          then analzye them together as a whole, or individually.
        </p>
        <p>
          For some materials, you might have information about the farms you&apos;re buying from,
          but for others, you&apos;re buying on an open commodity market. Where you don&apos;t have
          farm and field locations, it takes the data you have and uses a probabilistic model to
          estimate where your materials are most likely sourced. The software geolocates your
          procurement data, converting it to GIS data. It then calculates your impact and risks, and
          enables you to improve this understanding over time.
        </p>
      </div>
    ),
  },
  {
    id: 8,
    group: 'supply-chain-data',
    question: <>Should I wait for more accurate data before using LandGriffon?</>,
    answer: (
      <div className="space-y-5">
        <p>
          The great thing about LandGriffon is that it gives you a place to start, regardless of the
          level of detail you have about your supply chain. By using the tool, it can help you to
          focus on the materials and sourcing areas that are causing the most impact, and gives you
          direction on where to put your energy and resources into improving. Over time, your
          analysis can become more accurate as your supply chain data improves, allowing you to make
          more impactful sustainability decisions.
        </p>
      </div>
    ),
  },
];

export default FAQS;
