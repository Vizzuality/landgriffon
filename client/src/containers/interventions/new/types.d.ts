export type RegisterForm = Readonly<{
  register: (string) => void;
}>;

export type StepProps = Readonly<{
  handleCancel: () => void;
  handleInterventionData: () => void;
}>;
