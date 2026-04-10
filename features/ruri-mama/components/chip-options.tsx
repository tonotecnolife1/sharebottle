import { cn } from "@/lib/utils";

interface Props {
  question: string;
  options: string[];
  onPick: (value: string) => void;
  onSkip?: () => void;
}

export function ChipOptions({ question, options, onPick, onSkip }: Props) {
  return (
    <div className="rounded-2xl border border-amethyst-border bg-amethyst-muted px-4 py-3.5 space-y-2.5 animate-fade-in">
      <p className="text-label-md text-amethyst-dark">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            className={cn(
              "px-3.5 h-9 rounded-badge text-body-sm bg-pearl-warm text-amethyst-dark border border-amethyst-border",
              "hover:bg-amethyst hover:text-pearl hover:border-amethyst-dark transition-colors active:scale-95",
            )}
          >
            {opt}
          </button>
        ))}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 h-9 rounded-badge text-body-sm bg-transparent text-ink-secondary underline underline-offset-2 hover:text-amethyst-dark"
          >
            お任せ
          </button>
        )}
      </div>
    </div>
  );
}
