import Icon from 'components/icon';
import HEXAGON_SVG from 'svgs/map/hexagon.svg';

const ITEMS = [
  {
    id: 'XXX',
    name: 'Included areas',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-1 text-purple-500" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus eligendi doloremque unde, atque maxime dolore officiis quia architecto fugiat, dolorem animi vel! Velit minus facere maxime consequuntur iure. Nisi!',
  },
  {
    id: 'YYY',
    name: 'All features',
    icon: <div className="w-3 h-3 mt-1 bg-blue-500 rounded" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus eligendi doloremque unde, atque maxime.',
  },
  {
    id: 'ZZZ',
    name: 'Protected areas',
    icon: <div className="w-3 h-3 mt-1 bg-pink-500 rounded" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    id: 'basic-example-1',
    name: 'Basic example 1',
    icon: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    type: 'basic',
    items: [
      {
        value: 'Riots/Protests',
        color: '#cab2d6',
      },
      {
        value: 'Violence against civilians',
        color: '#8dd3c7',
      },
      {
        value: 'Battle-No change of territory',
        color: '#b15928',
      },
      {
        value: 'Remote violence',
        color: '#e31a1c',
      },
      {
        value: 'Strategic development',
        color: '#fb9a99',
      },
      {
        value: 'Battle-Government regains territory',
        color: '#33a02c',
      },
      {
        value: 'Battle-Non-state actor overtakes territory',
        color: '#b2df8a',
      },
      {
        value: 'Non-violent transfer of territory',
        color: '#1f78b4',
      },
      {
        value: 'Headquarters or base established',
        color: '#a6cee3',
      },
    ],
  },
  {
    id: 'choropleth-example-1',
    name: 'Choropleth example 1',
    icon: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    type: 'choropleth',
    items: [
      {
        value: '0 h',
        color: '#FFFFFF',
      }, {
        color: '#C0F09C',
        value: '1 h',
      }, {
        color: '#E3DA64',
        value: '2 h',
      }, {
        color: '#D16638',
        value: '3 h',
      }, {
        color: '#BA2D2F',
        value: '6 h',
      }, {
        color: '#A11F4A',
        value: '12 h',
      }, {
        color: '#730D6F',
        value: '1 d',
      }, {
        color: '#0D0437',
        value: '14 d',
      },
    ],
  },
  {
    id: 'gradient-example-1',
    name: 'Gradient example 1',
    icon: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    type: 'gradient',
    items: [
      {
        color: '#FFFFFF',
        value: '0',
      }, {
        color: '#C0F09C',
        value: null,
      }, {
        color: '#E3DA64',
        value: null,
      }, {
        color: '#D16638',
        value: '50',
      }, {
        color: '#BA2D2F',
        value: null,
      }, {
        color: '#A11F4A',
        value: null,
      }, {
        color: '#730D6F',
        value: null,
      }, {
        color: '#0D0437',
        value: '100',
      },
    ],
  },

];

export default ITEMS;
