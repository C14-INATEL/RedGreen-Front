const Home = () => {
  return (
    // Container principal com a cor de fundo e o padrão de naipe
    <div
      className="relative w-screen h-screen overflow-hidden suit-pattern"
      style={{ background: 'hsl(150 40% 12%)' }}
    >
      {/* Gradiente radial que brilha do centro para fora */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, hsl(150 35% 16% / 0.6) 0%, transparent 70%)',
        }}
      />

      {/* Gradiente de escurecimento na parte inferior da tela */}
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
