import { useNavigate } from 'react-router-dom';
import { Gambit } from '../games/Gambit';

export const GambitRoom = () => {
  const Navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden suit-pattern px-6 py-20">
      <button onClick={() => Navigate('/')} className="back-button">
        ←
      </button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-center">
        <Gambit />
      </div>
    </main>
  );
};
