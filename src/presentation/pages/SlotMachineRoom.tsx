import { useNavigate } from 'react-router-dom';
import { paths } from '../../paths';
import { SlotMachine } from '../games/SlotMachine';
import { Button } from '../ui/Button';

export const SlotMachineRoom = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(paths.home);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex-col gap-4">
        <div className="flex justify-start">
          <Button onClick={handleVoltar}>Voltar</Button>
        </div>
        <SlotMachine />
      </div>
    </main>
  );
};
