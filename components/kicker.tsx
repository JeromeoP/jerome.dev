interface KickerProps {
  index: string;
  label: string;
  note?: string;
}

export function Kicker({ index, label, note }: KickerProps) {
  return (
    <div
      data-reveal
      className="mb-12 flex items-baseline gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted max-md:mb-8"
    >
      <span className="text-accent">{index}</span>
      <span className="text-text-secondary">{label}</span>
      {note ? (
        <span className="ml-auto font-serif normal-case italic tracking-normal text-text-muted max-md:hidden">
          {note}
        </span>
      ) : null}
    </div>
  );
}
