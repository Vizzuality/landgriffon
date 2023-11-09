import { useCallback, useState } from 'react';

import Webinar from 'containers/methodology/webinar/component';
import Modal from 'components/modal';

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const handleDismissModal = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return (
    <Modal open={isOpen} onDismiss={handleDismissModal}>
      <Webinar />
    </Modal>
  );
};

export default WelcomeModal;
