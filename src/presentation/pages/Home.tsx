import Table from '@ui/Table';
import HUD from '../ui/HUD';

const Home = () => {
  const mockPlayerName = 'Apostador';
  const mockChips = 25000;

  return (
    <div className="relative w-screen h-screen overflow-hidden suit-pattern">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, hsl(150 35% 16% / 0.6) 0%, transparent 70%)',
        }}
      />

      <HUD playerName={mockPlayerName} chips={mockChips} />

      <div className="relative flex items-center justify-center h-full px-6 md:px-16 pt-20 pb-10">
        <Table />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, hsl(210 40% 2% / 0.4), transparent)',
        }}
      />
    </div>
  );
};

export default Home;
