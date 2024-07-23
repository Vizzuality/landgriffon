import { FC } from 'react';

import Link from 'next/link';

type CardTypes = {
  href: string;
  title: string;
  description: string;
};

const Card: FC<CardTypes> = ({ title, description, href }: CardTypes) => (
  <div className="inline-flex bg-blue-500">
    <Link href={href}>
      <a className="max-w-[250px] h-[327px] inline-flex w-full flex-col text-blue-400 hover:text-blue-600 relative flex-1 border-2 border-blue-400 space-y-5 p-6 py-4 items-start hover:bg-blue-400 bg-blue-900 hover:cursor-pointer">
        <div className="h-full w-full inline-flex flex-col justify-between">
          <h5 className="flex-1 font-semibold text-xl line-clamp-5 max-h-[50%]">{title}</h5>
          <p className="flex-1 font-light line-clamp-3 max-h-[50%] pb-2">{description}</p>
        </div>
      </a>
    </Link>
  </div>
);

export const SLIDES = [
  {
    id: '0',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5 mr-5">
        <Card
          href="https://medium.com/vizzuality-blog/global-esg-regulations-overview-for-2024-38990036d1d3"
          title="Global ESG Regulations — Overview for 2024"
          description="As we get stuck into 2024, lets recap the global ESG regulations to pay attention to. There’s a lot to keep track of — if you know of others let us know in the comments!"
        />

        <Card
          href="https://medium.com/vizzuality-blog/our-open-data-webinar-summary-the-planet-wont-wait-2dfdb5212410"
          title='Our Open-Data Webinar Summary: "The Planet Won&apos;t Wait"'
          description="Our latest LandGriffon webinar was convened to discuss the release of our new set of global, open-access datasets for nature accounting. Companies are uncertain about what data they can trust, what methodologies to use, and what regulations require of them. The webinar addressed the ways in which this data can help companies answer these questions."
        />

        <Card
          href="https://medium.com/vizzuality-blog/looking-to-set-science-based-targets-for-nature-landgriffon-will-set-you-up-for-success-8288c59c3030"
          title="Looking to set Science-Based Targets for Nature? LandGriffon will set you up for success."
          description="In a world where sustainability requirements are constantly evolving, the way companies measure their impact on nature must do the same, or risk being left behind."
        />
      </div>
    ),
  },
  {
    id: '1',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5 flex-1 mr-5">
        <Card
          href="https://medium.com/vizzuality-blog/the-three-upcoming-esg-regulations-every-company-should-pay-attention-to-f6153553552a"
          title="The three upcoming ESG regulations every company should pay attention to."
          description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures and EU Deforestation Law. In this blog, we summarize each and identify areas in which companies can prepare."
        />

        <Card
          href="https://medium.com/vizzuality-blog/make-vanilla-supply-chains-a-force-for-good-b52a3514b2f0"
          title="Make vanilla supply chains a force for good."
          description="Natural vanilla is one of the world’s most expensive spices due to its demanding cultivation methods. Its market is also one of the most volatile, often prompting uncertainty, poverty and illegal activity among smallholder growers. Companies have introduced some promising initiatives focused on improving living conditions and sustainability to promote stability in the vanilla supply chain, but as research suggests, they require the right insight, tools and data to truly comprehend sustainable vanilla production’s complexity."
        />

        <Card
          href="https://medium.com/vizzuality-blog/what-environmental-impacts-does-landgriffon-measure-82d6fccf2322"
          title="What environmental impacts does LandGriffon measure?"
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />
      </div>
    ),
  },

  {
    id: '2',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5 flex-1 mr-5">
        <Card
          href="https://medium.com/vizzuality-blog/landgriffon-in-action-an-example-case-study-35b7b9b6638c"
          title="LandGriffon in action: an example case study."
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />

        <Card
          href="https://medium.com/vizzuality-blog/how-can-companies-compare-sustainability-strategies-with-landgriffon-dace2bd56753"
          title="How can companies compare sustainability strategies with LandGriffon?"
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />
        <Card
          href="https://medium.com/vizzuality-blog/how-does-landgriffon-measure-environmental-impacts-5bcf733c0f04"
          title="How does LandGriffon measure environmental impacts?"
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5 flex-1 mr-5">
        <Card
          href="https://medium.com/vizzuality-blog/how-does-landgriffon-work-modeling-spatial-sourcing-fdc0132cbdef"
          title="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />
        <Card
          href="https://medium.com/vizzuality-blog/using-landgriffon-what-data-do-you-need-ea75b6ca4a44"
          title="Using LandGriffon: what data do you need?"
          description="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts. This blog is part of our methodology series. You can find more blogs on our methodology here, or head to our website and download the complete paper."
        />

        <Card
          href="https://medium.com/vizzuality-blog/nature-based-climate-solutions-companies-are-key-f48a8f198394"
          title="Nature-based climate solutions? Companies are key."
          description="In the context of growing global population and increasing demand for agricultural products, the joint goals of avoiding dangerous climate change and reversing the ongoing decline in the state of nature will require significant changes to many aspects of society. Agriculture, forestry, and land use change account for 23% of global greenhouse gas emissions (IPCC), while pressure from agriculture, deforestation, and land degradation is a dominant driver of biodiversity decline on land (IPBES). Agricultural land covered 37% of the global land surface area in 2019. Of this area, approximately one-third were croplands and two-thirds used for raising livestock (FAO 2021). This suggests that meeting growing food needs while reducing the environmental impacts of agriculture is one of the foremost challenges of the 21st century (Tim Searchinger et al. 2019)."
        />
      </div>
    ),
  },
  {
    id: '4',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5 flex-1 mr-5">
        <Card
          href="https://medium.com/vizzuality-blog/the-landgriffon-methodology-summary-version-28ec8fb4964"
          title="The LandGriffon Methodology — Summary Version"
          description="LandGriffon is a software service that helps companies assess risks and impacts from agricultural production in their supply chains and analyze possible futures. In this blog we summarize the methodology used by the LandGriffon platform."
        />

        <Card
          href="https://medium.com/vizzuality-blog/seeking-sustainability-in-rubber-supply-chains-cdc0a0065262"
          title="Seeking sustainability in rubber supply chains."
          description="Many companies are driven toward sustainable sourcing and practices. However, they lack the tools and information to trace materials effectively. Within complex supply chains, locating rubber origins and the circumstances around their production is especially challenging. Geospatial open data services help fill this knowledge gap and give direction on what actions are needed where."
        />
        <Card
          href="https://medium.com/vizzuality-blog/lifting-the-veil-from-fashion-brands-environmental-supply-chain-impacts-842563eab978"
          title="Lifting the veil from fashion brands’ environmental supply chain impacts."
          description="Open geospatial data is revealing the detrimental impact that the fashion industry is having on the environment, from water scarcity to deforestation. LandGriffon is a new service with which companies can harness this information to build more sustainable businesses for the future."
        />
      </div>
    ),
  },
  {
    id: '5',
    content: (
      <div className="md:grid md:grid-cols-3 md:gap-5 flex flex-col space-y-6 md:space-y-0 space-x-5">
        <Card
          href="https://medium.com/vizzuality-blog/tmi-dont-let-too-much-data-leave-you-in-the-dark-ecb7b206c291"
          title="TMI: Don’t let too much data leave you in the dark."
          description="LandGriffon collates data about company supply chains into one accessible dashboard. Map supply chains, benchmark data, and estimate potential environmental risks."
        />
      </div>
    ),
  },
];
