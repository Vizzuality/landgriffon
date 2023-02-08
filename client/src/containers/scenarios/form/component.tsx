import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import { Anchor, Button } from 'components/button';
import Toggle from 'components/toggle';
import { usePermissions } from 'hooks/permissions';
import { Permission, RoleName } from 'hooks/permissions/enums';

import type { Scenario, ScenarioFormData } from '../types';

type ScenarioFormProps = {
  scenario?: Scenario;
  isSubmitting?: boolean;
  onSubmit?: (scenario: ScenarioFormData) => void;
};

const schemaValidation = yup.object({
  title: yup.string().min(2).max(40).required(),
  isPublic: yup.boolean(),
  description: yup.string().optional().nullable(),
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
    formState: { errors, isValid },
  } = useForm<SubSchema>({
    resolver: yupResolver(schemaValidation),
    defaultValues: {
      title: scenario?.title || null,
      isPublic: scenario?.isPublic || false,
      description: scenario?.description || null,
    },
  });

  const { hasPermission } = usePermissions(scenario?.user?.id);
  // If scenario exists, check if the user can edit,
  // else, check if the user can create a scenario
  const canSave =
    (scenario?.id
      ? hasPermission(Permission.CAN_EDIT_SCENARIO)
      : hasPermission(Permission.CAN_CREATE_SCENARIO, false)) && isValid;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid w-full grid-cols-1 gap-6 mt-6"
      data-testid={`scenario-form-validation-${isValid}`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>
            Name <sup>*</sup>
          </label>
          <Input
            {...register('title')}
            type="text"
            defaultValue={scenario?.title}
            placeholder="Type a scenario name"
            aria-label="Name"
            autoFocus
            error={errors?.title?.message}
            data-testid="scenario-name-input"
            required
          />
        </div>
        <div className="flex flex-col">
          <label>Access</label>
          <div className="flex items-center h-full space-x-1">
            <Controller
              name="isPublic"
              control={control}
              render={({ field: { onChange: handleChangeIsPublic, value } }) => (
                <Toggle
                  data-testid="scenario-is-public-toggle"
                  active={value}
                  onChange={handleChangeIsPublic}
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
