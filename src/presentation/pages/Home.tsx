import { Button } from '../ui/Button';

export const Home = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Bem-vindo ao Cassino Web</h1>
    <Button onClick={() => alert('Hello!')}>Clique aqui</Button>
  </div>
);
