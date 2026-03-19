const CasinoLogo = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-0.5">
        <span className="w-5 h-px bg-muted-foreground/40" />
        <span className="text-accent text-[10px]">★</span>
        <span className="w-5 h-px bg-muted-foreground/40" />
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide">
        <span className="text-casino-red">Red</span>
        <span className="text-foreground/60 font-light italic mx-1">&amp;</span>
        <span className="text-accent">Green</span>
      </h1>
      <p className="text-casino-red text-[9px] tracking-[0.35em] uppercase font-display font-semibold">
        Cassino
      </p>
    </div>
  );
};

export default CasinoLogo;
