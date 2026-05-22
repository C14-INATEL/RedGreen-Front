type MinefieldEventTableProps = {
  className?: string;
};

export const MinefieldEventTable = ({
  className,
}: MinefieldEventTableProps) => (
  <div className={className}>
    <img
      alt=""
      aria-hidden="true"
      className="block h-full w-full select-none object-fill"
      draggable={false}
      src="/MineField/SpriteTable.png"
      style={{ imageRendering: 'pixelated' }}
    />
  </div>
);
