import Component from './component';

import type { AutoCompleteSelectProps } from './types';
import type { Option } from '../types';

const data: Option<number>[] = [
  { value: 1, label: 'Wade Cooper' },
  { value: 2, label: 'Arlene Mccoy', disabled: true },
  { value: 3, label: 'Devon Webb' },
  { value: 4, label: 'Tom Cook' },
  { value: 5, label: 'Tanya Fox' },
  { value: 6, label: 'Hellen Schmidt', disabled: true },
  { value: 7, label: 'Caroline Schultz' },
  { value: 8, label: 'Mason Heaney' },
  { value: 9, label: 'Claudie Smitham' },
  { value: 10, label: 'Emil Schaefer' },
];

export default {
  title: 'Components/Forms',
  component: Component,
  argTypes: {
    showHint: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    error: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    loading: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    disabled: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
  },
};

const Template = (args: AutoCompleteSelectProps<number>) => {
  return (
    <Component<number> {...args} name="people" options={data} placeholder="Select an person" />
  );
};

export const AutoCompleteSelect = Template.bind({});
