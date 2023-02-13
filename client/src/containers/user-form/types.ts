import type { ProfilePayload } from 'types';

export type UserFormProps = {
  user?: ProfilePayload;
  closeUserForm?: () => void;
};
