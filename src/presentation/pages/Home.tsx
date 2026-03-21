import { useNavigate } from 'react-router-dom';
import { paths } from '../../paths';
import { Button } from '../ui/Button';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bem-vindo ao Cassino Web</h1>
      <Button onClick={() => alert('Hello!')}>Clique aqui</Button>
      <div className="mt-4">
        <Button onClick={() => navigate(paths.slotmachineroom)}>
          Abrir caça-níquel
        </Button>
      </div>
    </div>
  );
};
