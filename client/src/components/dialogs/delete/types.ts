export type DeleteDialogProps = {
  isOpen?: boolean;
  title: string;
  description: string;
  onDelete: () => void;
  onClose: () => void;
};
