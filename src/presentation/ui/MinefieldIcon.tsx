const SELECTED_ICON_CELLS = new Set([6, 13, 21]);

const MinefieldIcon = () => (
  <div
    aria-hidden="true"
    className="grid h-20 w-20 grid-cols-5 gap-1 border-2 bg-card p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.45)]"
    style={{
      borderColor: 'hsl(var(--cassino-gold) / 0.7)',
    }}
  >
    {Array.from({ length: 25 }, (_, index) => (
      <span
        key={index}
        className="block border"
        style={{
          backgroundColor: SELECTED_ICON_CELLS.has(index)
            ? 'hsl(var(--cassino-red))'
            : 'hsl(var(--table-green-light))',
          borderColor: SELECTED_ICON_CELLS.has(index)
            ? 'hsl(var(--cassino-gold) / 0.8)'
            : 'hsl(var(--accent-green) / 0.6)',
        }}
      />
    ))}
  </div>
);

export default MinefieldIcon;
