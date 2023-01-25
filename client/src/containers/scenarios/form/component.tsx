import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import { Anchor, Button } from 'components/button';
import Toggle from 'components/toggle';
import { usePermissions } from 'hooks/permissions';
import { Permission } from 'hooks/permissions/enums';

import type { Scenario, ScenarioFormData } from '../types';

type ScenarioFormProps = {
  scenario?: Scenario;
  isSubmitting?: boolean;
  onSubmit?: (scenario: ScenarioFormData) => void;
};

const schemaValidation = yup.object({
  title: yup.string().min(2).max(40).required(),
  description: yup.string(),
  visibility: yup.boolean().required().default(true),
});

type SubSchema = yup.InferType<typeof schemaValidation>;

const ScenarioForm: React.FC<React.PropsWithChildren<ScenarioFormProps>> = ({
  children,
  scenario,
  isSubmitting,
  onSubmit,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubSchema>({
    resolver: yupResolver(schemaValidation),
    defaultValues: {
      visibility: true,
    },
  });

  const { hasPermission } = usePermissions(scenario?.userId);
  // If scenario exists, check if the user can edit,
  // else, check if the user can create a scenario
  const canSave = hasPermission(
    scenario?.id ? Permission.CAN_EDIT_SCENARIO : Permission.CAN_CREATE_SCENARIO,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-6 mt-6">
      <div className="grid grid-cols-2 gap-4">
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
        <div className="flex flex-col">
          <label>Access</label>
          <div className="flex items-center h-full space-x-1">
            <Controller
              name="visibility"
              control={control}
              render={({ field: { onChange: handleChangeVisibility, value } }) => (
                <Toggle
                  data-testid="scenario-visibility"
                  active={value}
                  onChange={handleChangeVisibility}
                  // ! this feature is disabled until the API allows to change the visibility of a scenario
                  disabled
                />
              )}
            />

            <span className="text-sm text-gray-500 peer-disabled:text-gray-300">
              Make scenario public
            </span>
          </div>
        </div>
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
        <Link href="/data/scenarios" passHref>
          <Anchor variant="secondary">Cancel</Anchor>
        </Link>
        <Button
          disabled={!canSave}
          loading={isSubmitting}
          type="submit"
          data-testid="create-scenario-button"
        >
          Save scenario
        </Button>
      </div>
    </form>
  );
};

export default ScenarioForm;
