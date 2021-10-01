import React from 'react';

import Image from 'next/image';

export interface CardProps {
  role: string;
  name: string;
  photo: string;
}

export const Card: React.FC<CardProps> = ({ role, name, photo }: CardProps) => (
  <div className="flex flex-col justify-between bg-white font-sans-semibold w-72 h-max rounded-3xl">
    <div className="p-5">
      <p className="text-sm text-green">{role}</p>
      <p className="text-xl text-black">{name}</p>
    </div>
    <Image className="rounded-b-3xl" alt="Susana Romão" src={photo} height="288px" width="266px" />
  </div>
);

export default Card;
