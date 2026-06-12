import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SessionExpiredModal } from './SessionExpiredModal';
import { paths } from '@/paths';

export const SessionExpiredListener = () => {
  const [ShowModal, SetShowModal] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const HandleSessionExpired = () => SetShowModal(true);
    window.addEventListener('session-expired', HandleSessionExpired);
    return () =>
      window.removeEventListener('session-expired', HandleSessionExpired);
  }, []);

  const HandleClose = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    SetShowModal(false);
    Navigate(paths.login);
  };

  return (
    <AnimatePresence>
      {ShowModal && <SessionExpiredModal OnClose={HandleClose} />}
    </AnimatePresence>
  );
};
