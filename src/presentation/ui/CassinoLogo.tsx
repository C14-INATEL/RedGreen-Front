const CassinoLogo = () => (
  <div className="text-center select-none">
    <div className="flex items-center justify-center gap-2 mb-1">
      <span className="text-cassino-gold font-display text-xs">◆ ◆ ◆</span>
    </div>
    <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide leading-none">
      <span className="text-cassino-red">Red</span>
      <span className="text-cassino-gold text-3xl md:text-4xl mx-1">&</span>
      <span className="text-accent-green">Green</span>
    </h1>
    <p className="text-cassino-red text-[8px] tracking-[0.3em] uppercase font-body mt-1">
      Cassino
    </p>
    <div className="flex items-center justify-center gap-1 mt-1">
      <div className="w-2 h-2 bg-cassino-gold" />
      <div className="w-2 h-2 bg-cassino-red" />
      <div className="w-2 h-2 bg-accent-green" />
    </div>
  </div>
);

export default CassinoLogo;
