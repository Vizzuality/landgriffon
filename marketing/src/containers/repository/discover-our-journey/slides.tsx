import { FC } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import Icon from 'components/icon';

import ARROW_SVG from 'svgs/ui/arrow-top-right.svg?sprite';

type CardTypes = {
  thumb: string;
  title: string;
  description: string;
};

const arrow = {
  default: {
    opacity: 0,
    x: -55,
    transition: {
      duration: 0,
      type: 'tween',
      delay: 0,
    },
  },
  hover: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      type: 'tween',
    },
  },
};

const Card: FC<CardTypes> = ({ thumb, title, description }: CardTypes) => (
  <motion.div
    initial="default"
    whileHover="hover"
    className="min-h-[430px] relative rounded-[38px] w-full border border-[#1D3786] border-opacity-90 space-y-5 flex flex-col p-14 items-start hover:bg-blue-900 hover:cursor-pointer"
  >
    <Image src={thumb} width={78} height={74} alt={title} layout="intrinsic" />
    <h5 className="font-bold text-xl flex">{title}</h5>
    <p className="font-light flex">{description}</p>
    <motion.div variants={arrow} className="w-full justify-end flex absolute bottom-14 right-14">
      <Icon icon={ARROW_SVG} className="w-14 h-11 rotate-45" />
    </motion.div>
  </motion.div>
);

export const SLIDES = [
  {
    id: '1',
    content: (
      <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
        <Card
          thumb="/images/repository/thumb_1.png"
          title="LandGriffon case study."
          description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
        />

        <Card
          thumb="/images/repository/thumb_2.png"
          title="Evolving ESG regulations"
          description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
        />
      </div>
    ),
  },
  {
    id: '2',
    content: (
      <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
        <Card
          thumb="/images/repository/thumb_1.png"
          title="LandGriffon case study."
          description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
        />

        <Card
          thumb="/images/repository/thumb_2.png"
          title="Evolving ESG regulations"
          description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
        />
      </div>
    ),
  },
  {
    id: '3',
    content: (
      <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
        <Card
          thumb="/images/repository/thumb_1.png"
          title="LandGriffon case study."
          description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
        />

        <Card
          thumb="/images/repository/thumb_2.png"
          title="Evolving ESG regulations"
          description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
        />
      </div>
    ),
  },
  {
    id: '4',
    content: (
      <div className="md:grid md:grid-cols-2 md:gap-5 w-full flex flex-col space-y-6 md:space-y-0">
        <Card
          thumb="/images/repository/thumb_1.png"
          title="LandGriffon case study."
          description="An example analysis of the impact of hypothetical sourcing of 1000 tonnes of palm oil in Aceh, Indonesia, with different levels of spatial sourcing precision and exploration of scenarios."
        />

        <Card
          thumb="/images/repository/thumb_2.png"
          title="Evolving ESG regulations"
          description="Three key proposals will change the ESG regulatory landscape. The EU CSRD & ESRS, SEC Climate-Related Disclosures, and EU Deforestation Law."
        />
      </div>
    ),
  },
];
