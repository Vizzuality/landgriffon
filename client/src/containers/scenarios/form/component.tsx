import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import { AnchorLink, Button } from 'components/button';

import type { Scenario } from '../types';

type ScenarioFormProps = {
  scenario?: Scenario;
  isSubmitting?: boolean;
  onSubmit?: (scenario: Scenario) => void;
};

const schemaValidation = yup.object({
  title: yup.string().min(2).required('Title must have at least two characters'),
  description: yup.string(),
});

const ScenarioForm: React.FC<React.PropsWithChildren<ScenarioFormProps>> = ({
  children,
  scenario,
  isSubmitting,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-6 mt-6">
      <div>
        <label>Name</label>
        <Input
          {...register('title')}
          type="text"
          name="title"
          id="title"
          defaultValue={scenario?.title}
          placeholder="Type a scenario name"
          aria-label="Name"
          autoFocus
          error={errors?.title?.message}
          data-testid="scenario-name-input"
        />
      </div>
      <div>
        <label>
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <Textarea
          {...register('description')}
          id="description"
          name="description"
          rows={3}
          className="w-full"
          error={errors?.description?.message}
          defaultValue={scenario?.description}
          data-testid="scenario-description-input"
        />
      </div>
      {children}
      <div className="flex justify-end space-x-6">
        <Link href="/admin/scenarios" passHref>
          <AnchorLink theme="secondary">Cancel</AnchorLink>
        </Link>
        <Button loading={isSubmitting} type="submit" data-testid="create-scenario-button">
          Save scenario
        </Button>
      </div>
    </form>
  );
};

export default ScenarioForm;
