import Component from './component';

import type { SelectProps, Option } from './types';

const data: Option<number>[] = [
  { value: 1, label: 'Wade Cooper' },
  { value: 2, label: 'Arlene Mccoy' },
  { value: 3, label: 'Devon Webb', disabled: true },
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

const Template = (args: SelectProps<number>) => {
  return (
    <Component<number>
      {...args}
      error={args.error ? 'This is an example of error message' : null}
      name="people"
      id="mySelect"
      options={data}
      placeholder="Select an person"
    />
  );
};

const MultipleTemplate = (args: SelectProps<number>) => {
  return (
    <Component<number>
      {...args}
      error={args.error ? 'This is an example of error message' : null}
      name="people"
      id="multiple-select"
      options={data}
      multiple
      placeholder="Select several people"
    />
  );
};

export const SimpleSelect = Template.bind({});
export const MutlipleSelect = MultipleTemplate.bind({});
